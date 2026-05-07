import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SettingsService } from './providers/settings.service';
import { UpdateSettingsBulkDto } from './dtos';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('all')
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
