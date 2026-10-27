
import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { SellersService } from './sellers.service';
import { ApplySellerDto } from './dto/apply-seller.dto';
import { ReviewSellerDto } from './dto/review-seller.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@Controller('sellers')
export class SellersController {
  constructor(
    private readonly sellersService: SellersService,
  ) {}

  @Post('apply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  apply(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ApplySellerDto,
  ) {
    return this.sellersService.apply(
      req.user.userId,
      dto,
    );
  }

  @Get('public/:userId')
  getPublicShop(@Param('userId') userId: string) {
    return this.sellersService.getPublicShop(userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  getMyApplication(@Req() req: AuthenticatedRequest) {
    return this.sellersService.getMyApplication(
      req.user.userId,
    );
  }

  @Patch('me/shop')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  updateMyShop(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateShopDto,
  ) {
    return this.sellersService.updateMyShop(req.user.userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findApplications(@Query('status') status?: string) {
    return this.sellersService.findApplications(status);
  }

  @Patch(':id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  reviewApplication(
    @Param('id') sellerId: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: ReviewSellerDto,
  ) {
    return this.sellersService.reviewApplication(
      sellerId,
      req.user.userId,
      dto,
    );
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateSellerStatus(
    @Param('id') sellerId: string,
    @Body('status') status: 'approved' | 'suspended',
  ) {
    if (status !== 'approved' && status !== 'suspended') {
      throw new BadRequestException('Status must be approved or suspended');
    }
    return this.sellersService.updateSellerStatus(sellerId, status);
  }

}
