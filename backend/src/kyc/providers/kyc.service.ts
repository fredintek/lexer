import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateKycDto,
  GetKycQueryDto,
  KYCStatus,
  UpdateKYCStatusDto,
} from '../dtos';
import { ActiveUserInterface } from 'src/lib/types';
import { KYC_FOLDER } from 'src/lib/constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Kyc } from '../entities/kyc.entity';
import {
  Between,
  DataSource,
  FindOptionsWhere,
  Like,
  Repository,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { FileUploadProvider } from 'src/common/providers/FileUploader';

export interface KycUploadPayload {
  frontBuffer: Buffer<ArrayBufferLike>;
  backBuffer: Buffer<ArrayBufferLike>;
  frontMime: string;
  backMime: string;
  email: string;
}

@Injectable()
export class KycService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Kyc)
    private readonly kycRepository: Repository<Kyc>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly fileUploader: FileUploadProvider,
  ) {}

  public async findAllRequests(getKycQueryDto: GetKycQueryDto) {
    const { search, status, startDate, endDate } = getKycQueryDto;

    let where: FindOptionsWhere<Kyc> | FindOptionsWhere<Kyc>[] = {};

    if (search) {
      where = [
        { user: { fullname: Like(`%${search}%`) } },
        { user: { email: Like(`%${search}%`) } },
        { user: { tag: Like(`%${search}%`) } },
      ];
    }

    const applyFilters = (baseWhere: FindOptionsWhere<Kyc>) => {
      if (status) baseWhere.status = status;
      if (startDate && endDate) {
        baseWhere.createdAt = Between(new Date(startDate), new Date(endDate));
      }
      return baseWhere;
    };

    if (Array.isArray(where)) {
      where = where.map((condition) => applyFilters(condition));
    } else {
      where = applyFilters(where);
    }

    return await this.kycRepository.find({
      where,
      relations: ['user', 'reviewedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  public async createRequest(
    currentUser: ActiveUserInterface,
    createKycDto: CreateKycDto,
    front: Express.Multer.File,
    back: Express.Multer.File,
  ) {
    // 1. Find user and their existing KYC record
    const targetUser = await this.userRepository.findOne({
      where: { id: currentUser?.userId },
      relations: ['kyc'],
    });

    if (!targetUser) throw new NotFoundException('User not found');

    // 2. Prevent upload if already Active or Pending
    if (targetUser.kyc) {
      if (targetUser.kyc.status === KYCStatus.APPROVED) {
        throw new BadRequestException('You are already verified.');
      }
      if (targetUser.kyc.status === KYCStatus.PENDING) {
        throw new BadRequestException(
          'Your verification is currently under review.',
        );
      }
    }

    // 3. Upload new images
    const results = await this.processUploadKyc({
      backBuffer: back.buffer,
      frontBuffer: front.buffer,
      backMime: back.mimetype,
      frontMime: front.mimetype,
      email: targetUser?.email,
    });

    // 4. Update existing or create new
    let kycInstance = targetUser.kyc;

    if (kycInstance) {
      // RE-UPLOAD LOGIC: Update the existing instance
      kycInstance.documentType = createKycDto.documentType;
      kycInstance.country = createKycDto.country;
      kycInstance.front = {
        url: results.frontResult.url,
        publicId: results.frontResult.publicId,
      };
      kycInstance.back = {
        url: results.backResult.url,
        publicId: results.backResult.publicId,
      };
      kycInstance.status = KYCStatus.PENDING;
      kycInstance.rejectionReason = undefined;
    } else {
      // INITIAL UPLOAD: Create new instance
      kycInstance = this.kycRepository.create({
        ...createKycDto,
        front: {
          url: results.frontResult.url,
          publicId: results.frontResult.publicId,
        },
        back: {
          url: results.backResult.url,
          publicId: results.backResult.publicId,
        },
        status: KYCStatus.PENDING,
        user: targetUser,
      });
    }

    return await this.kycRepository.save(kycInstance);
  }

  public async updateStatus(
    id: string | undefined,
    dto: UpdateKYCStatusDto,
    adminId: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Try to find the KYC record within the transaction
      let kyc = await queryRunner.manager.findOne(Kyc, {
        where: { id },
        relations: ['user'],
      });

      // 2. Handle Admin Bypass (Creation)
      if (!kyc) {
        if (dto.adminPass && dto.userId) {
          const user = await queryRunner.manager.findOne(User, {
            where: { id: dto.userId },
          });

          if (!user) {
            throw new NotFoundException(
              'User not found for manual KYC creation',
            );
          }

          // Initialize the instance (but don't save yet)
          kyc = queryRunner.manager.create(Kyc, {
            user: user,
            documentType: 'id-card', // Placeholder
            country: 'System-Admin-Approved', // Placeholder
            status: KYCStatus.PENDING, // Will be updated to APPROVED below
          });
        } else {
          throw new NotFoundException(`KYC Request with ID ${id} not found`);
        }
      }

      // 3. Logic Guard: Prevent redundant approvals
      if (
        kyc.status === KYCStatus.APPROVED &&
        dto.status === KYCStatus.APPROVED
      ) {
        throw new BadRequestException('This KYC is already active');
      }

      // 4. Update KYC Entity Fields
      kyc.status = dto.status;
      kyc.reviewedById = adminId;
      kyc.reviewedAt = new Date();
      kyc.rejectionReason =
        dto.status === KYCStatus.REJECTED ? dto.rejectionReason : undefined;

      // 5. Save KYC (This handles both Create and Update)
      const savedKyc = await queryRunner.manager.save(kyc);

      // 6. Upgrade User Tier if Approved
      if (dto.status === KYCStatus.APPROVED) {
        await queryRunner.manager.update(User, kyc.user.id, {
          tier: 2,
        });
      }

      await queryRunner.commitTransaction();

      // 7. Return the fresh record with relations
      return await this.kycRepository.findOne({
        where: { id: savedKyc.id },
        relations: ['user', 'reviewedBy'],
      });
    } catch (err: any) {
      // Rollback everything if any step fails
      await queryRunner.rollbackTransaction();

      // Pass through specific exceptions (like NotFound or BadRequest)
      if (err instanceof HttpException) throw err;

      throw new BadRequestException(
        'Failed to update KYC status: ' + err.message,
      );
    } finally {
      // Crucial: always release the runner
      await queryRunner.release();
    }
  }

  private async processUploadKyc(data: KycUploadPayload) {
    const { frontBuffer, backBuffer, frontMime, backMime, email } = data;

    // Convert arrays back to Buffers
    const front = Buffer.from(frontBuffer);
    const back = Buffer.from(backBuffer);

    // Step 3 — Upload both images
    const [frontResult, backResult] = await Promise.all([
      this.fileUploader.uploadBuffer(
        front,
        'kyc',
        `kyc_front_${email}`,
        frontMime,
      ),
      this.fileUploader.uploadBuffer(
        back,
        `kyc`,
        `kyc_back_${email}`,
        backMime,
      ),
    ]);

    return {
      frontResult,
      backResult,
    };
  }
}
