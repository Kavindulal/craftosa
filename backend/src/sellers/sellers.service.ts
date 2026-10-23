
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  Seller,
  SellerDocument,
  SellerStatus,
} from './seller.schema';
import { ApplySellerDto } from './dto/apply-seller.dto';
import { ReviewSellerDto } from './dto/review-seller.dto';

@Injectable()
export class SellersService {
  constructor(
    @InjectModel(Seller.name)
    private readonly sellerModel: Model<SellerDocument>,
  ) {}

  // POST /sellers/apply
  async apply(userId: string, dto: ApplySellerDto) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const existing = await this.sellerModel
      .findOne({ user: new Types.ObjectId(userId) })
      .exec();

    if (existing) {
      throw new ConflictException(
        'A seller application already exists for this account',
      );
    }

    const seller = await this.sellerModel.create({
      user: new Types.ObjectId(userId),
      shopName: dto.shopName.trim(),
      bio: dto.bio.trim(),
      craftTypes: dto.craftTypes.map((item) => item.trim()),
      city: dto.city.trim(),
      profileImageUrl: dto.profileImageUrl?.trim() ?? '',
      coverImageUrl: dto.coverImageUrl?.trim() ?? '',
      status: SellerStatus.PENDING,
    });

    return {
      message: 'Seller application submitted successfully',
      seller: {
        id: seller._id.toString(),
        shopName: seller.shopName,
        craftTypes: seller.craftTypes,
        city: seller.city,
        profileImageUrl: seller.profileImageUrl || '',
        coverImageUrl: seller.coverImageUrl || '',
        status: seller.status,
        createdAt: seller.createdAt,
      },
    };
  }

  // PUBLIC: Return approved shop information for customer-facing pages.
  async getPublicShop(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid seller ID');
    }

    const seller = await this.sellerModel
      .findOne({
        user: new Types.ObjectId(userId),
        status: SellerStatus.APPROVED,
      })
      .select('user shopName bio craftTypes city status createdAt profileImageUrl coverImageUrl')
      .populate('user', 'name')
      .lean()
      .exec();

    if (!seller) {
      throw new NotFoundException('This shop is not available publicly');
    }

    return {
      id: seller._id.toString(),
      userId: (seller.user as any)?._id?.toString?.() ?? userId,
      sellerName: (seller.user as any)?.name ?? '',
      shopName: seller.shopName,
      bio: seller.bio,
      craftTypes: seller.craftTypes,
      city: seller.city,
      profileImageUrl: seller.profileImageUrl || '',
      coverImageUrl: seller.coverImageUrl || '',
      status: seller.status,
      createdAt: seller.createdAt,
    };
  }

  // GET /sellers/me
  async getMyApplication(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    // The Seller schema stores the account reference as an ObjectId.
    // Query with the same type so existing applications are found reliably.
    const seller = await this.sellerModel
      .findOne({ user: new Types.ObjectId(userId) })
      .populate('user', 'name email role')
      .exec();

    if (!seller) {
      throw new NotFoundException(
        'No seller application found for this account',
      );
    }

    return seller;
  }


  // PATCH /sellers/me/shop - update the authenticated seller's shop details.
  async updateMyShop(userId: string, dto: import('./dto/update-shop.dto').UpdateShopDto) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const seller = await this.sellerModel.findOne({ user: new Types.ObjectId(userId) }).exec();
    if (!seller) {
      throw new NotFoundException('No seller shop found for this account. Complete the seller application first.');
    }

    seller.shopName = dto.shopName.trim();
    seller.bio = dto.bio.trim();
    seller.craftTypes = dto.craftTypes.map((item) => item.trim()).filter(Boolean);
    seller.city = dto.city.trim();
    if (dto.profileImageUrl !== undefined) seller.profileImageUrl = dto.profileImageUrl.trim();
    if (dto.coverImageUrl !== undefined) seller.coverImageUrl = dto.coverImageUrl.trim();
    await seller.save();

    return {
      message: 'Shop details updated successfully',
      seller: {
        id: seller._id.toString(),
        shopName: seller.shopName,
        bio: seller.bio,
        craftTypes: seller.craftTypes,
        city: seller.city,
        status: seller.status,
      },
    };
  }

  // GET /sellers?status=pending (admin only)
  async findApplications(status?: string) {
    if (
      status &&
      !Object.values(SellerStatus).includes(status as SellerStatus)
    ) {
      throw new BadRequestException(
        'Status must be pending, approved, or rejected',
      );
    }

    const filter = status
      ? { status: status as SellerStatus }
      : {};

    return this.sellerModel
      .find(filter)
      .populate('user', 'name email role')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  // PATCH /sellers/:id/review (admin only)
  async reviewApplication(
    sellerId: string,
    adminId: string,
    dto: ReviewSellerDto,
  ) {
    if (!Types.ObjectId.isValid(sellerId)) {
      throw new BadRequestException('Invalid seller application ID');
    }

    if (!Types.ObjectId.isValid(adminId)) {
      throw new BadRequestException('Invalid admin user ID');
    }

    if (
      dto.status === 'rejected' &&
      !dto.rejectionReason?.trim()
    ) {
      throw new BadRequestException(
        'A rejection reason is required when rejecting an application',
      );
    }

    const seller = await this.sellerModel
      .findById(sellerId)
      .exec();

    if (!seller) {
      throw new NotFoundException('Seller application not found');
    }

    if (seller.status !== SellerStatus.PENDING) {
      throw new ConflictException(
        'Only pending applications can be reviewed',
      );
    }

    seller.status = dto.status as SellerStatus;
    seller.reviewedBy = new Types.ObjectId(adminId);
    seller.reviewedAt = new Date();
    seller.rejectionReason =
      dto.status === 'rejected'
        ? dto.rejectionReason!.trim()
        : null;

    await seller.save();

    return {
      message: `Seller application ${seller.status}`,
      seller: {
        id: seller._id.toString(),
        shopName: seller.shopName,
        status: seller.status,
        rejectionReason: seller.rejectionReason,
        reviewedAt: seller.reviewedAt,
      },
    };
  }
}
