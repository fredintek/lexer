import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

interface FileValidationOptions {
  allowedMimeTypes: string[];
  maxSizeBytes: number;
  required?: boolean;
}

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(
    private readonly fieldOptions: Record<string, FileValidationOptions>,
  ) {}

  transform(
    files: Record<string, Express.Multer.File[]>,
    metadata: ArgumentMetadata,
  ) {
    if (!files) {
      const requiredFields = Object.entries(this.fieldOptions)
        .filter(([_, opts]) => opts.required !== false)
        .map(([field]) => field);

      if (requiredFields.length > 0) {
        throw new BadRequestException(
          `Missing required files: ${requiredFields.join(', ')}`,
        );
      }
      return files;
    }

    for (const [field, options] of Object.entries(this.fieldOptions)) {
      const fieldFiles = files[field];

      // Required check
      if (
        options.required !== false &&
        (!fieldFiles || fieldFiles.length === 0)
      ) {
        throw new BadRequestException(`File "${field}" is required`);
      }

      if (!fieldFiles || fieldFiles.length === 0) continue;

      for (const file of fieldFiles) {
        // MIME type check
        if (!options.allowedMimeTypes.includes(file.mimetype)) {
          throw new BadRequestException(
            `File "${field}" has invalid type "${file.mimetype}". Allowed: ${options.allowedMimeTypes.join(', ')}`,
          );
        }

        // Size check
        if (file.size > options.maxSizeBytes) {
          const maxMb = (options.maxSizeBytes / (1024 * 1024)).toFixed(1);
          const actualMb = (file.size / (1024 * 1024)).toFixed(1);
          throw new BadRequestException(
            `File "${field}" is too large (${actualMb}MB). Max allowed: ${maxMb}MB`,
          );
        }
      }
    }

    return files;
  }
}
