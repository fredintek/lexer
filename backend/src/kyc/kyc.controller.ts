import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { KycService } from './providers/kyc.service';
import { Permissions } from 'src/auth/decorators/auth.decorator';
import { PERMISSIONS } from 'src/lib/permissions';
import { CreateKycDto, UpdateKYCStatusDto } from './dtos';
import { ActiveUserInterface } from 'src/lib/types';
import { ActiveUser } from 'src/auth/decorators/activeUser.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { GetUsersQueryDto } from 'src/user/dtos';

@Controller('kyc')
export class KycController {
    constructor(private readonly kycService: KycService) {}

    @Get()
    @Permissions(PERMISSIONS.CAN_MANAGE_KYC)
  async getAllRequests(@Query() getUsersQueryDto: GetUsersQueryDto) {
    return this.kycService.findAllRequests(getUsersQueryDto);
  }

  @Patch(':id/status')
  @Permissions(PERMISSIONS.CAN_MANAGE_KYC)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateKYCStatusDto: UpdateKYCStatusDto,
    @ActiveUser() currentUser: ActiveUserInterface
  ) {
    return this.kycService.updateStatus(id, updateKYCStatusDto, currentUser.userId);
}

@Post('upload')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'document', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
  ]))
  async uploadDocuments(
    @ActiveUser() currentUser: ActiveUserInterface,
    @Body() createKycDto: CreateKycDto,
    @UploadedFiles() files: { document?: Express.Multer.File[], selfie?: Express.Multer.File[] }
  ) {
    if (!files.document || !files.selfie) {
      throw new BadRequestException('Both document and selfie are required');
    }

    return this.kycService.createRequest(currentUser, createKycDto, files.document[0], files.selfie[0]);
  }

}
