import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './providers/settings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from './entities/settings.entity';

@Module({
  controllers: [SettingsController],
  providers: [SettingsService],
  imports: [TypeOrmModule.forFeature([Setting])],
})
export class SettingsModule {}
