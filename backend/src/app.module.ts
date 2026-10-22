
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SellersModule } from './sellers/sellers.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    // Load environment variables from .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Connect to MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
      }),
    }),

    // Application modules
    AuthModule,
    SellersModule,
    ProductsModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
