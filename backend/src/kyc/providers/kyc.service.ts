import {
  BadRequestException,
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
import { CloudinaryService } from 'src/cloudinary/providers/cloudinary.service';
import { AVATAR_FOLDER, KYC_FOLDER } from 'src/lib/constants';
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

@Injectable()
export class KycService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly dataSource: DataSource,
    @InjectRepository(Kyc)
    private readonly kycRepository: Repository<Kyc>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

    // 3. Upload new images (Cloudinary)
    const uploadedFront = await this.cloudinaryService.uploadImage(
      front,
      KYC_FOLDER,
    );
    const uploadedBack = await this.cloudinaryService.uploadImage(
      back,
      KYC_FOLDER,
    );

    // 4. Update existing or create new
    let kycInstance = targetUser.kyc;

    if (kycInstance) {
      // RE-UPLOAD LOGIC: Update the existing instance
      kycInstance.documentType = createKycDto.documentType;
      kycInstance.country = createKycDto.country;
      kycInstance.front = {
        url: uploadedFront.secure_url,
        publicId: uploadedFront.public_id,
      };
      kycInstance.back = {
        url: uploadedBack.secure_url,
        publicId: uploadedBack.public_id,
      };
      kycInstance.status = KYCStatus.PENDING;
      kycInstance.rejectionReason = undefined;
    } else {
      // INITIAL UPLOAD: Create new instance
      kycInstance = this.kycRepository.create({
        ...createKycDto,
        front: {
          url: uploadedFront.secure_url,
          publicId: uploadedFront.public_id,
        },
        back: {
          url: uploadedBack.secure_url,
          publicId: uploadedBack.public_id,
        },
        status: KYCStatus.PENDING,
        user: targetUser,
      });
    }

    return await this.kycRepository.save(kycInstance);
  }

  public async updateStatus(
    id: string,
    dto: UpdateKYCStatusDto,
    adminId: string,
  ) {
    // 1. Check if the request exists
    const kyc = await this.kycRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!kyc) {
      throw new NotFoundException(`KYC Request with ID ${id} not found`);
    }

    // 2. Prevent re-processing already active KYC
    if (
      kyc.status === KYCStatus.APPROVED &&
      dto.status === KYCStatus.APPROVED
    ) {
      throw new BadRequestException('This KYC is already active');
    }

    // 3. Start Transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update KYC Record
      kyc.status = dto.status;
      kyc.reviewedById = adminId;
      kyc.reviewedAt = new Date();

      if (dto.status === KYCStatus.REJECTED) {
        kyc.rejectionReason = dto.rejectionReason;
      } else {
        kyc.rejectionReason = undefined;
      }

      await queryRunner.manager.save(kyc);

      // 4. Upgrade User Tier if Approved
      if (dto.status === KYCStatus.APPROVED) {
        await queryRunner.manager.update(User, kyc.user.id, {
          tier: 2,
        });
      }

      await queryRunner.commitTransaction();
      return await this.kycRepository.findOne({
        where: { id },
        relations: ['user', 'reviewedBy'],
      });
    } catch (err) {
      // Rollback if anything goes wrong
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Failed to update KYC status');
    } finally {
      await queryRunner.release();
    }
  }
}
