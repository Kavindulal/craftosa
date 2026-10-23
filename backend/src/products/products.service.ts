
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
import { Seller, SellerDocument, SellerStatus } from '../sellers/seller.schema';
import { Order, OrderDocument } from '../orders/order.schema';
import { Review, ReviewDocument } from './review.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Seller.name)
    private readonly sellerModel: Model<SellerDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Review.name) private readonly reviewModel: Model<ReviewDocument>,
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

  // PUBLIC: List active products only for an approved seller's shop.
  async findPublicSellerProducts(sellerId: string) {
    if (!Types.ObjectId.isValid(sellerId)) {
      throw new BadRequestException('Invalid seller ID');
    }
    const approvedSeller = await this.sellerModel.findOne({
      user: new Types.ObjectId(sellerId),
      status: SellerStatus.APPROVED,
    }).select('_id').lean().exec();
    if (!approvedSeller) {
      throw new NotFoundException('This shop is not available publicly');
    }
    return this.productModel.find({
      seller: new Types.ObjectId(sellerId),
      status: ProductStatus.ACTIVE,
    }).sort({ createdAt: -1 }).lean().exec();
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

  // PUBLIC: Get product reviews and aggregate rating.
  async findProductReviews(productId: string) {
    if (!Types.ObjectId.isValid(productId)) throw new BadRequestException('Invalid product ID');
    const product = await this.productModel.findOne({ _id: new Types.ObjectId(productId), status: ProductStatus.ACTIVE }).select('_id').lean().exec();
    if (!product) throw new NotFoundException('Product not found');
    const [reviews, summary] = await Promise.all([
      this.reviewModel.find({ productId: new Types.ObjectId(productId) }).sort({ createdAt: -1 }).limit(100).lean().exec(),
      this.reviewModel.aggregate([{ $match: { productId: new Types.ObjectId(productId) } }, { $group: { _id: '$productId', averageRating: { $avg: '$rating' }, reviewCount: { $sum: 1 }, ratingCounts: { $push: '$rating' } } }]).exec(),
    ]);
    const counts = [1, 2, 3, 4, 5].map(rating => ({ rating, count: reviews.filter(review => review.rating === rating).length }));
    return { reviews, summary: { averageRating: summary[0]?.averageRating || 0, reviewCount: summary[0]?.reviewCount || 0, ratingCounts: counts } };
  }

  // CUSTOMER: Only customers with a delivered order containing this product may review it.
  async createProductReview(customerId: string, productId: string, dto: { rating: number; comment: string }) {
    if (!Types.ObjectId.isValid(customerId) || !Types.ObjectId.isValid(productId)) throw new BadRequestException('Invalid customer or product ID');
    if (!Number.isInteger(Number(dto.rating)) || Number(dto.rating) < 1 || Number(dto.rating) > 5) throw new BadRequestException('Rating must be a whole number from 1 to 5');
    const comment = String(dto.comment || '').trim();
    if (comment.length < 3 || comment.length > 1000) throw new BadRequestException('Review must be between 3 and 1000 characters');
    const product = await this.productModel.findOne({ _id: new Types.ObjectId(productId), status: ProductStatus.ACTIVE }).select('_id').lean().exec();
    if (!product) throw new NotFoundException('Product not found');
    const orders = await this.orderModel.find({ customer: new Types.ObjectId(customerId), status: 'delivered', 'items.productId': new Types.ObjectId(productId) }).select('_id items customerName').lean().exec();
    const eligible = orders.find(order => order.items.some((item: any) => String(item.productId) === productId && item.status === 'delivered'));
    if (!eligible) throw new BadRequestException('You can review this product after an order containing it has been delivered.');
    const alreadyReviewed = await this.reviewModel.exists({ productId: new Types.ObjectId(productId), customerId: new Types.ObjectId(customerId), orderId: eligible._id });
    if (alreadyReviewed) throw new BadRequestException('You have already reviewed this product for this order.');
    try {
      return await this.reviewModel.create({ productId: new Types.ObjectId(productId), customerId: new Types.ObjectId(customerId), orderId: eligible._id, rating: Number(dto.rating), comment, customerName: eligible.customerName || 'Verified customer' });
    } catch (error: any) {
      if (error?.code === 11000) throw new BadRequestException('You have already reviewed this product for this order.');
      throw error;
    }
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
