import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument, ProductStatus } from '../products/product.schema';
import {
  AdminNotification,
  AdminNotificationDocument,
  AdminNotificationType,
} from './notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(AdminNotification.name)
    private readonly notificationModel: Model<AdminNotificationDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(input: {
    type: AdminNotificationType;
    title: string;
    message: string;
    targetUrl?: string;
    relatedEntityId?: string;
    priority?: 'low' | 'medium' | 'high';
  }) {
    if (input.relatedEntityId && Types.ObjectId.isValid(input.relatedEntityId)) {
      const existing = await this.notificationModel.findOne({
        type: input.type,
        relatedEntityId: new Types.ObjectId(input.relatedEntityId),
      }).exec();
      if (existing) return existing;
    }

    return this.notificationModel.create({
      type: input.type,
      title: input.title,
      message: input.message,
      targetUrl: input.targetUrl || '',
      relatedEntityId: input.relatedEntityId && Types.ObjectId.isValid(input.relatedEntityId)
        ? new Types.ObjectId(input.relatedEntityId)
        : null,
      priority: input.priority || 'medium',
      isRead: false,
    });
  }

  async findForAdmin() {
    const [notifications, outOfStock] = await Promise.all([
      this.notificationModel.find().sort({ createdAt: -1 }).limit(100).lean().exec(),
      this.productModel.find({ stock: 0, status: ProductStatus.ACTIVE })
        .select('_id name seller stock createdAt')
        .sort({ createdAt: -1 }).limit(100).lean().exec(),
    ]);

    const stockAlerts = outOfStock.map((product: any) => ({
      _id: `stock-${product._id.toString()}`,
      type: AdminNotificationType.OUT_OF_STOCK,
      title: 'Product out of stock',
      message: `${product.name} has no stock remaining. Notify the seller to restock it.`,
      targetUrl: '/admin/sellers',
      relatedEntityId: product._id.toString(),
      isRead: false,
      priority: 'high' as const,
      createdAt: product.createdAt || new Date(),
      isVirtual: true,
    }));

    return [...notifications.map((item: any) => ({ ...item, isVirtual: false })), ...stockAlerts]
      .sort((a: any, b: any) => new Date(String(b.createdAt)).getTime() - new Date(String(a.createdAt)).getTime());
  }

  async unreadCount() {
    const [stored, stockCount] = await Promise.all([
      this.notificationModel.countDocuments({ isRead: false }).exec(),
      this.productModel.countDocuments({ stock: 0, status: ProductStatus.ACTIVE }).exec(),
    ]);
    return { count: stored + stockCount };
  }

  async markRead(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Notification not found');
    const notification = await this.notificationModel.findByIdAndUpdate(
      id, { isRead: true }, { new: true },
    ).exec();
    if (!notification) throw new NotFoundException('Notification not found');
    return { message: 'Notification marked as read', notification };
  }

  async markAllRead() {
    await this.notificationModel.updateMany({ isRead: false }, { isRead: true }).exec();
    return { message: 'Notifications marked as read' };
  }
}
