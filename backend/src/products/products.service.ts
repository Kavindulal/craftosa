
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  Product,
  ProductDocument,
  ProductStatus,
} from './product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  // PUBLIC MARKETPLACE: View active products without login.
  async findMarketplaceProducts(
    search?: string,
    category?: string,
  ) {
    const filter: Record<string, any> = {
      status: ProductStatus.ACTIVE,
    };

    if (category?.trim() && category !== 'All Products') {
      const escapedCategory = category
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      filter.category = {
        $regex: `^${escapedCategory}$`,
        $options: 'i',
      };
    }

    if (search?.trim()) {
      const escapedSearch = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      filter.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { title: { $regex: escapedSearch, $options: 'i' } },
        { description: { $regex: escapedSearch, $options: 'i' } },
        { category: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    return this.productModel
      .find(filter)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  // PUBLIC: View one active product without login.
  async findPublicProductById(productId: string) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel
      .findOne({
        _id: new Types.ObjectId(productId),
        status: ProductStatus.ACTIVE,
      })
      .lean()
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  // SELLER: Create a product.
  async create(sellerId: string, dto: CreateProductDto) {
    if (!Types.ObjectId.isValid(sellerId)) {
      throw new BadRequestException('Invalid seller ID');
    }

    const product = await this.productModel.create({
      ...dto,
      seller: new Types.ObjectId(sellerId),
      status: ProductStatus.ACTIVE,
    });

    return {
      message: 'Product created successfully',
      product,
    };
  }

  // SELLER: Get own products.
  async findMyProducts(sellerId: string) {
    if (!Types.ObjectId.isValid(sellerId)) {
      throw new BadRequestException('Invalid seller ID');
    }

    return this.productModel
      .find({ seller: new Types.ObjectId(sellerId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  // SELLER: Get one of their own products.
  async findOne(productId: string, sellerId: string) {
    if (
      !Types.ObjectId.isValid(productId) ||
      !Types.ObjectId.isValid(sellerId)
    ) {
      throw new BadRequestException('Invalid product or seller ID');
    }

    const product = await this.productModel
      .findOne({
        _id: new Types.ObjectId(productId),
        seller: new Types.ObjectId(sellerId),
      })
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  // SELLER: Update their own product.
  async update(
    productId: string,
    sellerId: string,
    dto: UpdateProductDto,
  ) {
    if (
      !Types.ObjectId.isValid(productId) ||
      !Types.ObjectId.isValid(sellerId)
    ) {
      throw new BadRequestException('Invalid product or seller ID');
    }

    const product = await this.productModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(productId),
          seller: new Types.ObjectId(sellerId),
        },
        { $set: dto },
        { new: true, runValidators: true },
      )
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      message: 'Product updated successfully',
      product,
    };
  }

  // SELLER: Delete their own product.
  async remove(productId: string, sellerId: string) {
    if (
      !Types.ObjectId.isValid(productId) ||
      !Types.ObjectId.isValid(sellerId)
    ) {
      throw new BadRequestException('Invalid product or seller ID');
    }

    const product = await this.productModel
      .findOneAndDelete({
        _id: new Types.ObjectId(productId),
        seller: new Types.ObjectId(sellerId),
      })
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      message: 'Product deleted successfully',
    };
  }
}
