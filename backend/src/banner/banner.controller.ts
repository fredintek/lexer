import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Auth, Permissions } from 'src/auth/decorators/auth.decorator';
import { BannerService } from './providers/banner.service';
import { BannerType } from './entities/banner.entity';
import { CreateBannerDto, UpdateBannerDto } from './dtos';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthType } from 'src/lib/constants';
import { PERMISSIONS } from 'src/lib/permissions';

@Controller('banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Get()
  @Auth(AuthType.None)
  async getBanners(
    @Query('type') type?: BannerType,
    @Query('isActive', new ParseBoolPipe({ optional: true }))
    isActive?: boolean,
  ) {
    return this.bannerService.findAll(type, isActive);
  }

  @Post()
  @Permissions(PERMISSIONS.CAN_MANAGE_BANNER)
  @UseInterceptors(FileInterceptor('file'))
  async createBanner(
    @Body() createBannerDto: CreateBannerDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.bannerService.create(createBannerDto, file);
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.CAN_MANAGE_BANNER)
  @UseInterceptors(FileInterceptor('file'))
  async updateBanner(
    @Param('id') id: string,
    @Body() updateBannerDto: UpdateBannerDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.bannerService.update(id, updateBannerDto, file);
  }

  @Patch(':id/toggle')
  @Permissions(PERMISSIONS.CAN_MANAGE_BANNER)
  async toggleBanner(@Param('id') id: string) {
    return this.bannerService.toggleStatus(id);
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.CAN_MANAGE_BANNER)
  async deleteBanner(@Param('id') id: string) {
    return this.bannerService.remove(id);
  }
}
