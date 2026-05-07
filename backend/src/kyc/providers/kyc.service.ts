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
import { DataSource, Like, Repository } from 'typeorm';
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
    const queryOptions: any = {
      relations: ['user'],
      order: { createdAt: 'DESC' },
    };

    if (getKycQueryDto?.search) {
      queryOptions.where = [
        { user: { fullname: Like(`%${getKycQueryDto?.search}%`) } },
        { user: { email: Like(`%${getKycQueryDto?.search}%`) } },
        { user: { tag: Like(`%${getKycQueryDto?.search}%`) } },
      ];
    }
    return await this.kycRepository.find(queryOptions);
  }

  public async createRequest(
    currentUser: ActiveUserInterface,
    createKycDto: CreateKycDto,
    docFile: Express.Multer.File,
    selfieFile: Express.Multer.File,
  ) {
    // 1. Find user and their existing KYC record
    const targetUser = await this.userRepository.findOne({
      where: { id: currentUser?.userId },
      relations: ['kyc'],
    });

    if (!targetUser) throw new NotFoundException('User not found');

    // 2. Prevent upload if already Active or Pending
    if (targetUser.kyc) {
      if (targetUser.kyc.status === KYCStatus.ACTIVE) {
        throw new BadRequestException('You are already verified.');
      }
      if (targetUser.kyc.status === KYCStatus.PENDING) {
        throw new BadRequestException(
          'Your verification is currently under review.',
        );
      }
    }

    // 3. Upload new images (Cloudinary)
    const uploadedDoc = await this.cloudinaryService.uploadImage(
      docFile,
      KYC_FOLDER,
    );
    const uploadedSelfie = await this.cloudinaryService.uploadImage(
      selfieFile,
      KYC_FOLDER,
    );

    // 4. Update existing or create new
    let kycInstance = targetUser.kyc;

    if (kycInstance) {
      // RE-UPLOAD LOGIC: Update the existing instance
      kycInstance.documentType = createKycDto.documentType;
      kycInstance.country = createKycDto.country;
      kycInstance.docData = {
        url: uploadedDoc.secure_url,
        publicId: uploadedDoc.public_id,
      };
      kycInstance.selfieData = {
        url: uploadedSelfie.secure_url,
        publicId: uploadedSelfie.public_id,
      };
      kycInstance.status = KYCStatus.PENDING;
      kycInstance.rejectionReason = undefined;
    } else {
      // INITIAL UPLOAD: Create new instance
      kycInstance = this.kycRepository.create({
        ...createKycDto,
        docData: {
          url: uploadedDoc.secure_url,
          publicId: uploadedDoc.public_id,
        },
        selfieData: {
          url: uploadedSelfie.secure_url,
          publicId: uploadedSelfie.public_id,
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
    if (kyc.status === KYCStatus.ACTIVE && dto.status === KYCStatus.ACTIVE) {
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

      if (dto.status === KYCStatus.INACTIVE) {
        kyc.rejectionReason = dto.rejectionReason;
      } else {
        kyc.rejectionReason = undefined;
      }

      await queryRunner.manager.save(kyc);

      // 4. Upgrade User Tier if Approved
      if (dto.status === KYCStatus.ACTIVE) {
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
