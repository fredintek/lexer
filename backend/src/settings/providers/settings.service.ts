import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Setting } from '../entities/settings.entity';
import { Repository } from 'typeorm';
import { UpdateSettingsBulkDto } from '../dtos';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepo: Repository<Setting>,
  ) {}

  public async getSettingsByGroup(group: string) {
    const settings = await this.settingRepo.find({ where: { group } });
    return this.mapSettings(settings);
  }

  // Helper to convert DB array to a usable object
  private mapSettings(settings: Setting[]) {
    return settings.reduce(
      (acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      },
      {} as Record<string, string>,
    );
  }

  public async updateSettings(updateSettingsBulkDto: UpdateSettingsBulkDto) {
    // Ensure we are accessing the 'settings' property defined in your DTO
    const settingsEntries = Object.entries(
      updateSettingsBulkDto.settings || {},
    );

    for (const [key, data] of settingsEntries) {
      await this.settingRepo.upsert(
        {
          key,
          value: String(data.value),
          group: data.group || 'general',
        },
        ['key'],
      );
    }
    return { success: true };
  }

  public async getAllSettings() {
    const settings = await this.settingRepo.find();
    return settings;
  }
}
