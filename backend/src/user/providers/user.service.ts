import {
  BadRequestException,
  ConflictException,
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User, UserStatus } from '../entities/user.entity';
import { In, Like, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CloudinaryService } from 'src/cloudinary/providers/cloudinary.service';
import { ActiveUserInterface } from 'src/lib/types';
import { AVATAR_FOLDER } from 'src/lib/constants';
import {
  CreateUserAdminDto,
  GetUsersQueryDto,
  UpdateUserAdminDto,
  UpdateUserProfileDto,
} from '../dtos';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Role } from 'src/role/entities/roles.entity';
import * as crypto from 'crypto';
import { AuthService } from 'src/auth/providers/auth.service';
import { EmailService } from 'src/email/providers/email.service';
import { ConfigService } from '@nestjs/config';
import { Trade, TradeStatusEnum } from 'src/trade/entities/trade.entity';
import { KYCStatus } from 'src/kyc/dtos';

@Injectable()
export class UserService {
  constructor(
    /**
     * Injecting User Repository
     */
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Trade)
    private readonly tradeRepository: Repository<Trade>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    /**
     * Injecting Cloudinary Service
     */
    private readonly cloudinaryService: CloudinaryService,

    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,

    private readonly emailService: EmailService,

    private readonly configService: ConfigService,

    /**
     * Injecting Event Emitter
     */
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Find user by email
   */
  public async findUserByEmail(email: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        relations: ['role'],
      });

      if (!user) throw new NotFoundException('Invalid email');

      return user;
    } catch (error: any) {
      throw new HttpException(error.message, error.status ?? 500);
    }
  }

  /**
   * Update Avatar
   */
  public async updateAvatar(
    activeUser: ActiveUserInterface,
    file: Express.Multer.File,
  ) {
    const targetUser = await this.userRepository.findOne({
      where: { id: activeUser.userId },
    });

    if (!targetUser) throw new NotFoundException('User not found');

    // capture old avatar
    const oldAvatar = targetUser.avatar?.publicId;

    // upload new avatar
    const result = await this.cloudinaryService.uploadImage(
      file,
      AVATAR_FOLDER,
    );

    // update DB with new data
    await this.userRepository.update(targetUser.id, {
      avatar: { publicId: result.public_id, url: result.secure_url },
    });

    // delete old avatar
    if (oldAvatar) {
      await this.cloudinaryService
        .deleteFile(oldAvatar as string)
        .catch((err) => {
          console.error('Cloudinary Cleanup Failed:', err);
        });
    }

    // Emit the event (This is non-blocking!)
    this.eventEmitter.emit('user.activity', {
      userId: activeUser.userId,
      type: 'PROFILE',
      description: 'Avatar chnaged',
    });

    return { url: result.secure_url, publicId: result.public_id };
  }

  public async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  public async updateUserProfile(
    activeUser: ActiveUserInterface,
    updateUserProfileDto: UpdateUserProfileDto,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: activeUser?.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Merges the new data into the user entity
    Object.assign(user, updateUserProfileDto);

    // Save handles the update and returns the new state
    const updatedUser = await this.userRepository.save(user);

    // Emit the event (This is non-blocking!)
    this.eventEmitter.emit('user.activity', {
      userId: activeUser.userId,
      type: 'PROFILE',
      description: 'Profile information updated',
    });

    // We return the updated user (minus excluded fields like password)
    return updatedUser;
  }

  public async updateFcmToken(userId: string, token: string) {
    return this.userRepository.update(userId, { fcmToken: token });
  }

  public async findAll(
    getUsersQueryDto: GetUsersQueryDto,
    currentUser: ActiveUserInterface,
  ) {
    const { search, kycStatus, accountStatus, page, limit } = getUsersQueryDto;

    const take = limit || 10;
    const skip = ((page || 1) - 1) * take;

    const baseWhere: any = { id: Not(currentUser.userId) };

    if (accountStatus && accountStatus !== 'ALL') {
      baseWhere.status = accountStatus;
    }

    if (kycStatus && kycStatus !== 'ALL') {
      baseWhere.kyc = { status: kycStatus };
    }

    const queryOptions: any = {
      relations: ['role', 'kyc'],
      order: { createdAt: 'DESC' },
      take: take,
      skip: skip,
    };

    if (search) {
      queryOptions.where = [
        { ...baseWhere, fullname: Like(`%${search}%`) },
        { ...baseWhere, email: Like(`%${search}%`) },
        { ...baseWhere, tag: Like(`%${search}%`) },
      ];
    } else {
      queryOptions.where = baseWhere;
    }

    const [items, total] = await this.userRepository.findAndCount(queryOptions);

    return {
      items,
      total,
      page: page || 1,
      lastPage: Math.ceil(total / take),
    };
  }

  public async getUserMetrics() {
    // We run these in parallel for better performance
    const [total, active, pendingKyc, suspended, balanceData] =
      await Promise.all([
        this.userRepository.count(),
        this.userRepository.countBy({ status: UserStatus.ACTIVE }),
        this.userRepository.countBy({ kyc: { status: KYCStatus.PENDING } }),
        this.userRepository.countBy({ status: UserStatus.SUSPENDED }),
        this.userRepository
          .createQueryBuilder('user')
          .select('SUM(user.balance)', 'total')
          .getRawOne(),
      ]);

    return {
      totalUsers: total,
      activeUsers: active,
      pendingKyc: pendingKyc,
      suspendedUsers: suspended,
      totalBalance: parseFloat(balanceData?.total || '0'),
    };
  }

  public async adminCreateUser(dto: CreateUserAdminDto) {
    const { email, fullname, roleId } = dto;

    // 1. Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('A user with this email already exists.');
    }

    // 2. Find the role
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Selected role not found.');

    // 3. Generate a temporary "fake" password
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await this.authService.hashPassowrd(tempPassword);

    // 4. Generate a unique tag (e.g., @arda_1234)
    const tag = await this.authService.generateUniqueTag(
      this.userRepository.manager,
    );

    try {
      const newUser = this.userRepository.create({
        email,
        fullname,
        role,
        tag,
        password: hashedPassword,
        balance: 0,
        tier: 1,
        isWelcomeEmailSent: true,
      });

      const savedUser = await this.userRepository.save(newUser);

      // 5. Send Invitation Email
      await this.emailService.sendAdminInvitation(savedUser.email, {
        fullname: savedUser.fullname,
        tempPassword: tempPassword,
        loginUrl: `${this.configService.get('app.frontend_url')}/auth/login`,
        role: role?.name,
      });

      return savedUser;
    } catch (error) {
      throw new InternalServerErrorException('Error creating user account.');
    }
  }

  public async softDelete(id: string, currentUser: ActiveUserInterface) {
    // 1. Prevent self-deletion
    if (currentUser && id === currentUser.userId) {
      throw new BadRequestException(
        'You cannot delete your own administrative account.',
      );
    }

    // 2. Find the user
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // 3. Perform soft delete
    // This will populate the 'deletedAt' column automatically
    await this.userRepository.softRemove(user);

    return {
      message: `User ${user.fullname} has been deactivated successfully.`,
      deletedId: id,
    };
  }

  public async adminUpdateUser(id: string, dto: UpdateUserAdminDto) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) throw new NotFoundException('User not found');

    // 1. Handle Role Update
    if (dto.roleId) {
      const role = await this.roleRepository.findOne({
        where: { id: dto.roleId },
      });
      if (!role) throw new NotFoundException('Target role not found');
      user.role = role;
    }

    // 2. Extract roleId to prevent it from being assigned to the user object directly
    const { roleId, ...updateData } = dto;

    // 3. Update remaining fields (fullname, email, tier, pushEnabled, etc.)
    Object.assign(user, updateData);

    try {
      return await this.userRepository.save(user);
    } catch (error: any) {
      // PostgreSQL unique violation code
      if (error.code === '23505') {
        throw new ConflictException('Email or Tag already in use');
      }
      throw new InternalServerErrorException('Failed to update user profile');
    }
  }

  public async getUserDetails(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role', 'kyc'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  public async getUserDetailsByIds(ids: string[]): Promise<User[]> {
    if (!ids.length) return [];

    return this.userRepository.find({
      where: { id: In(ids) },
      relations: ['role'],
    });
  }

  public async getUserStatistics(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['balance', 'frozenBalance'],
      loadEagerRelations: false,
    });

    const stats = await this.tradeRepository
      .createQueryBuilder('trade')
      .where('trade.userId = :userId', { userId })
      .andWhere('trade.status = :status', { status: TradeStatusEnum.COMPLETED })
      .select([
        'COUNT(trade.id) AS totalTrades',
        'SUM(trade.pnl) AS totalPnl',
        'SUM(trade.quantity * trade.priceAtExecution) AS totalInvested',
        // Win Rate calculation: count trades where PnL > 0
        'COUNT(CASE WHEN trade.pnl > 0 THEN 1 END) AS winCount',
        // Profit Factor calculation: Sum of profits / Sum of losses
        'SUM(CASE WHEN trade.pnl > 0 THEN trade.pnl ELSE 0 END) AS grossProfit',
        'SUM(CASE WHEN trade.pnl < 0 THEN ABS(trade.pnl) ELSE 0 END) AS grossLoss',
      ])
      .getRawOne();

    const totalTrades = parseInt(stats.totalTrades) || 0;
    const winCount = parseInt(stats.winCount) || 0;
    const grossProfit = parseFloat(stats.grossProfit) || 0;
    const grossLoss = parseFloat(stats.grossLoss) || 0;

    return {
      balance: user?.balance || 0,
      totalTrades,
      totalPnl: parseFloat(stats.totalPnl) || 0,
      totalInvested: parseFloat(stats.totalInvested) || 0,
      // Calculations for your MetricCards
      winRate: totalTrades > 0 ? (winCount / totalTrades) * 100 : 0,
      avgProfit: winCount > 0 ? grossProfit / winCount : 0,
      profitFactor:
        grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 100 : 0,
    };
  }
}
