import {
  BadRequestException,
  Controller,
  Post,
  Req,
  Body,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CloudinaryService } from './cloudinary.service';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string; role: string };
}

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const PURPOSES: Record<string, { folder: string; roles: string[] }> = {
  profile: { folder: 'craftosa/users', roles: ['customer', 'seller', 'admin'] },
  'shop-logo': { folder: 'craftosa/sellers/logos', roles: ['seller', 'admin'] },
  'shop-banner': { folder: 'craftosa/sellers/banners', roles: ['seller', 'admin'] },
  product: { folder: 'craftosa/products', roles: ['seller', 'admin'] },
  chat: { folder: 'craftosa/chat', roles: ['customer', 'seller'] },
  review: { folder: 'craftosa/reviews', roles: ['customer'] },
};

@Controller('media')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('customer', 'seller', 'admin')
export class MediaController {
  constructor(private readonly cloudinary: CloudinaryService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
      if (!IMAGE_TYPES.includes(file.mimetype)) {
        return callback(new BadRequestException('Upload a JPG, PNG, WebP, or GIF image.'), false);
      }
      callback(null, true);
    },
  }))
  async upload(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: { buffer: Buffer; mimetype: string } | undefined,
    @Body('purpose') purposeValue: string,
  ) {
    if (!file) throw new BadRequestException('Choose an image to upload.');
    const purpose = String(purposeValue || '').trim();
    const config = PURPOSES[purpose];
    if (!config) {
      throw new BadRequestException(`Invalid image purpose. Allowed values: ${Object.keys(PURPOSES).join(', ')}.`);
    }
    if (!config.roles.includes(req.user.role)) {
      throw new BadRequestException('Your account role cannot upload this type of image.');
    }

    const folder = `${config.folder}/${req.user.userId}`;
    return this.cloudinary.uploadImage(file.buffer, file.mimetype, folder);
  }
}
