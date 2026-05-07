import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Banner, BannerType } from '../entities/banner.entity';
import { Repository } from 'typeorm';
import { CreateBannerDto, UpdateBannerDto } from '../dtos';
import { CloudinaryService } from 'src/cloudinary/providers/cloudinary.service';
import { BANNER_FOLDER } from 'src/lib/constants';

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepo: Repository<Banner>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  public async findAll(type?: BannerType, isActive?: boolean) {
    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return await this.bannerRepo.find({
      where,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  public async create(
    createBannerDto: CreateBannerDto,
    file?: Express.Multer.File,
  ) {
    let imageData: any = null;

    // 1. Upload to Cloudinary if a file is provided
    if (file) {
      try {
        const result = await this.cloudinaryService.uploadImage(
          file,
          BANNER_FOLDER,
        );
        imageData = {
          publicId: result.public_id,
          url: result.secure_url,
        };
      } catch (error) {
        console.error('Cloudinary Upload Failed during creation:', error);
        throw new Error('Failed to upload banner image');
      }
    }
    const banner = this.bannerRepo.create({
      ...createBannerDto,
      image: imageData,
    });
    return await this.bannerRepo.save(banner);
  }

  public async update(
    id: string,
    updateBannerDto: UpdateBannerDto,
    file?: Express.Multer.File,
  ) {
    const banner = await this.bannerRepo.preload({ id, ...updateBannerDto });
    if (!banner) throw new NotFoundException('Banner not found');

    let imageData = banner.image;

    // If a new file is provided, upload it and cleanup the old one
    if (file) {
      const oldPublicId = banner.image?.publicId;

      const result = await this.cloudinaryService.uploadImage(
        file,
        BANNER_FOLDER,
      );
      imageData = { publicId: result.public_id, url: result.secure_url };

      // Cleanup old image from Cloudinary
      if (oldPublicId) {
        this.cloudinaryService
          .deleteFile(oldPublicId)
          .catch((err) => console.error('Banner Image Cleanup Failed:', err));
      }
    }

    // Update the banner with new data and new image info
    return await this.bannerRepo.save({
      ...banner,
      ...updateBannerDto,
      image: imageData,
    });
  }

  public async remove(id: string) {
    const banner = await this.bannerRepo.findOneBy({ id });
    if (!banner) throw new NotFoundException('Banner not found');

    const publicId = banner.image?.publicId;

    const removalResult = await this.bannerRepo.remove(banner);

    if (publicId) {
      this.cloudinaryService.deleteFile(publicId).catch((err) => {
        console.error(`Cloudinary Cleanup Failed for banner ${id}:`, err);
      });
    }
    return {
      success: true,
      message: 'Banner and associated media deleted successfully',
      data: removalResult,
    };
  }

  public async toggleStatus(id: string) {
    const banner = await this.bannerRepo.findOneBy({ id });
    if (!banner) throw new NotFoundException('Banner not found');
    banner.isActive = !banner.isActive;
    return await this.bannerRepo.save(banner);
  }
}
