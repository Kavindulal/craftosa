import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryService } from './cloudinary.service';
import { MediaController } from './media.controller';

@Global()
@Module({
  imports: [AuthModule],
  controllers: [MediaController],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class MediaModule {}
