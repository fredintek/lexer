// banner/entities/banner.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum BannerType {
  HERO = 'hero',
  FOOTER = 'footer',
}

@Entity()
export class Banner {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    title!: string;

    @Column({ type: 'simple-json', nullable: true })
    image!: { publicId: string; url: string };

    @Column({ nullable: true })
    link!: string;

    @Column({ type: 'enum', enum: BannerType, default: BannerType.HERO })
    type!: BannerType;

    @Column({ default: 0 })
    order!: number;

    @Column({ default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}