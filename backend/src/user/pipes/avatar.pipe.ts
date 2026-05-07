import { ArgumentMetadata, BadRequestException, Injectable, PayloadTooLargeException, PipeTransform, UnprocessableEntityException } from '@nestjs/common';

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
const capSize = 10 * 1024 * 1024

@Injectable()
export class AvatarPipe implements PipeTransform {
  transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
    if (!value)
      throw new BadRequestException('Please upload avatar');


    // validate avatar mimetype
    if (!allowedMimeTypes.includes(value.mimetype))
      throw new UnprocessableEntityException(
        `avatar format can be either (${allowedMimeTypes.join(', ')})`,
      );

      // validate file size
    if (value.size > capSize)
      throw new PayloadTooLargeException(
        `avatar larger than 10mb`,
      );
      
    return value;
  }
}
