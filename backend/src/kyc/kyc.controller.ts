import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { KycService } from './providers/kyc.service';
import { Permissions, UserStatus } from 'src/auth/decorators/auth.decorator';
import { PERMISSIONS } from 'src/lib/permissions';
import { CreateKycDto, GetKycQueryDto, UpdateKYCStatusDto } from './dtos';
import { ActiveUserInterface } from 'src/lib/types';
import { ActiveUser } from 'src/auth/decorators/activeUser.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UserStatus as UserStatusEnum } from 'src/user/entities/user.entity';

@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Get()
  @Permissions(PERMISSIONS.CAN_MANAGE_KYC)
  async getAllRequests(@Query() getKycQueryDto: GetKycQueryDto) {
    return this.kycService.findAllRequests(getKycQueryDto);
  }

  @Patch(':id/status')
  @Permissions(PERMISSIONS.CAN_MANAGE_KYC)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateKYCStatusDto: UpdateKYCStatusDto,
    @ActiveUser() currentUser: ActiveUserInterface,
  ) {
    return this.kycService.updateStatus(
      id,
      updateKYCStatusDto,
      currentUser.userId,
    );
  }

  @Post('upload')
  @UserStatus(
    UserStatusEnum.ACTIVE,
    UserStatusEnum.PENDING,
    UserStatusEnum.SUSPENDED,
    UserStatusEnum.DEACTIVATED,
  )
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'front', maxCount: 1 },
      { name: 'back', maxCount: 1 },
    ]),
  )
  async uploadDocuments(
    @ActiveUser() currentUser: ActiveUserInterface,
    @Body() createKycDto: CreateKycDto,
    @UploadedFiles()
    files: { front?: Express.Multer.File[]; back?: Express.Multer.File[] },
  ) {
    if (!files.front || !files.back) {
      throw new BadRequestException('Both document and selfie are required');
    }

    return this.kycService.createRequest(
      currentUser,
      createKycDto,
      files.front[0],
      files.back[0],
    );
  }
}
