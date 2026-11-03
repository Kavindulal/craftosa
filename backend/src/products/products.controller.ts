
import {
  Body,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Readable } from 'node:stream';
import { v2 as cloudinary } from 'cloudinary';
import { Request } from 'express';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
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

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  // PUBLIC: Get all active products for the marketplace.
  @Get()
  findMarketplaceProducts(
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.productsService.findMarketplaceProducts(
      search,
      category,
    );
  }

  // PUBLIC: Get active products belonging to an approved seller.
  @Get('public/seller/:sellerId')
  findPublicSellerProducts(@Param('sellerId') sellerId: string) {
    return this.productsService.findPublicSellerProducts(sellerId);
  }

  // PUBLIC: Get one active product for customer details page.
  @Get('public/:id')
  findPublicProductById(@Param('id') id: string) {
    return this.productsService.findPublicProductById(id);
  }

  // PUBLIC: List reviews and rating summary for an active product.
  @Get('public/:id/reviews')
  findProductReviews(@Param('id') id: string) {
    return this.productsService.findProductReviews(id);
  }

  // CUSTOMER ONLY: Create a review after a delivered purchase.
  @Post('public/:id/reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  createProductReview(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: { rating: number; comment: string },
  ) {
    return this.productsService.createProductReview(req.user.userId, id, dto);
  }

  @Post('upload-image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)) return callback(new BadRequestException('Upload a JPG, PNG, WebP, or GIF image.'), false);
      callback(null, true);
    },
  }))
  async uploadProductImage(@UploadedFile() file: { buffer: Buffer; mimetype: string } | undefined) {
    if (!file) throw new BadRequestException('Choose an image to upload.');

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      throw new BadRequestException('Image storage is not configured. Please contact the administrator.');
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'craftosa/products';
    const signatureBase = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const { createHash } = await import('node:crypto');
    const signature = createHash('sha1').update(signatureBase).digest('hex');

    const form = new FormData();
    form.append('file', new Blob([file.buffer], { type: file.mimetype }), 'product-image');
    form.append('api_key', apiKey);
    form.append('timestamp', String(timestamp));
    form.append('folder', folder);
    form.append('signature', signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: form,
    });
    const result = await response.json() as { secure_url?: string; error?: { message?: string } };
    if (!response.ok || !result.secure_url) {
      throw new BadRequestException(result.error?.message || 'Could not store the product image.');
    }

    return { imageUrl: result.secure_url };
  }
  // SELLER ONLY: Create a product.
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create(
      req.user.userId,
      dto,
    );
  }

  // SELLER ONLY: Get own products.
  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  findMyProducts(@Req() req: AuthenticatedRequest) {
    return this.productsService.findMyProducts(
      req.user.userId,
    );
  }

  // CUSTOMER ONLY: List wishlist products.
  @Get('wishlist')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  getWishlist(@Req() req: AuthenticatedRequest) {
    return this.productsService.getWishlist(req.user.userId);
  }

  // CUSTOMER ONLY: Get saved product IDs.
  @Get('wishlist/ids')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  getWishlistIds(@Req() req: AuthenticatedRequest) {
    return this.productsService.getWishlistIds(req.user.userId);
  }

  // CUSTOMER ONLY: Add a product to wishlist.
  @Post('wishlist/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  addToWishlist(@Req() req: AuthenticatedRequest, @Param('productId') productId: string) {
    return this.productsService.addToWishlist(req.user.userId, productId);
  }

  // CUSTOMER ONLY: Remove a product from wishlist.
  @Delete('wishlist/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  removeFromWishlist(@Req() req: AuthenticatedRequest, @Param('productId') productId: string) {
    return this.productsService.removeFromWishlist(req.user.userId, productId);
  }

  // SELLER ONLY: Get one of their own products.
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  findOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.productsService.findOne(
      id,
      req.user.userId,
    );
  }

  // SELLER ONLY: Update their own product.
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  update(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(
      id,
      req.user.userId,
      dto,
    );
  }

  // SELLER ONLY: Delete their own product.
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.productsService.remove(
      id,
      req.user.userId,
    );
  }
}
