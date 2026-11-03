import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';

interface CloudinaryUploadResponse {
  secure_url?: string;
  public_id?: string;
  resource_type?: string;
  format?: string;
  bytes?: number;
  error?: { message?: string };
}

@Injectable()
export class CloudinaryService {
  constructor(private readonly config: ConfigService) {}

  async uploadImage(buffer: Buffer, mimetype: string, folder: string) {
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new ServiceUnavailableException('Cloudinary image storage is not configured.');
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = createHash('sha1')
      .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');

    const form = new FormData();
    form.append('file', new Blob([buffer as unknown as BlobPart], { type: mimetype }), 'craftosa-image');
    form.append('api_key', apiKey);
    form.append('timestamp', String(timestamp));
    form.append('folder', folder);
    form.append('signature', signature);

    let response: Response;
    try {
      response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
        method: 'POST',
        body: form,
      });
    } catch {
      throw new ServiceUnavailableException('Could not connect to image storage. Please try again.');
    }

    const result = await response.json() as CloudinaryUploadResponse;
    if (!response.ok || !result.secure_url || !result.public_id) {
      throw new ServiceUnavailableException(result.error?.message || 'Cloudinary could not store this image.');
    }

    return {
      imageUrl: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type || 'image',
      format: result.format || '',
      bytes: result.bytes || buffer.length,
    };
  }
}
