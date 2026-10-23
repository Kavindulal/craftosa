
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/roles.guard';
import { Product, ProductSchema } from './product.schema';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Seller, SellerSchema } from '../sellers/seller.schema';
import { Order, OrderSchema } from '../orders/order.schema';
import { Review, ReviewSchema } from './review.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Seller.name, schema: SellerSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, RolesGuard],
  exports: [ProductsService],
})
export class ProductsModule {}
