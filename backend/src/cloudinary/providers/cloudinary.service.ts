import { Injectable } from '@nestjs/common';
import { UploadApiResponse } from 'cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import toStream from 'buffer-to-stream';

@Injectable()
export class CloudinaryService {
    /**
     * 
     * Upload file to cloudinary
     */
    public async uploadImage(file: Express.Multer.File, folder: string): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream({folder: folder.replace(/\/+$/, ""), resource_type: "auto" }, (error, result) => {
                if (error) return reject(error);
                resolve(result!);
            })
            toStream(file.buffer).pipe(upload)
        })
    }

    /**
     * 
     * Delete file from cloudinary
     */
    public async deleteFile(publicId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(publicId, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            })
        })
    }
}
