
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/roles.guard';
import { Seller, SellerSchema } from './seller.schema';
import { SellersController } from './sellers.controller';
import { SellersService } from './sellers.service';

@Module({
  imports: [
    AuthModule,
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
