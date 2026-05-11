import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SettingsService } from './providers/settings.service';
import { UpdateSettingsBulkDto } from './dtos';
import { UserStatus } from 'src/auth/decorators/auth.decorator';
import { UserStatus as UserStatusEnum } from 'src/user/entities/user.entity';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('all')
  @UserStatus(
    UserStatusEnum.ACTIVE,
    UserStatusEnum.PENDING,
    UserStatusEnum.SUSPENDED,
    UserStatusEnum.DEACTIVATED,
  )
  async findAll() {
    return this.settingsService.getAllSettings();
  }

  @Get('group/:group')
  async getByGroup(@Param('group') group: string) {
    return this.settingsService.getSettingsByGroup(group);
  }

  @Post('bulk')
  async updateBulk(@Body() updateSettingsBulkDto: UpdateSettingsBulkDto) {
    return this.settingsService.updateSettings(updateSettingsBulkDto);
  }
}
