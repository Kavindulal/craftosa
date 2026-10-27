
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/roles.guard';
import { Seller, SellerSchema } from './seller.schema';
import { SellersController } from './sellers.controller';
import { SellersService } from './sellers.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    AuthModule,
    NotificationsModule,
    MongooseModule.forFeature([
      {
        name: Seller.name,
        schema: SellerSchema,
      },
    ]),
  ],
  controllers: [SellersController],
  providers: [SellersService, RolesGuard],
  exports: [SellersService],
})
export class SellersModule {}
