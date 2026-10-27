import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AdminNotificationDocument = HydratedDocument<AdminNotification>;

export enum AdminNotificationType {
  SELLER_APPLICATION = 'seller_application',
  CUSTOMER_COMPLAINT = 'customer_complaint',
  SELLER_SUSPENDED = 'seller_suspended',
  PRODUCT_FLAGGED = 'product_flagged',
  OUT_OF_STOCK = 'out_of_stock',
  SYSTEM = 'system',
}

@Schema({ timestamps: true })
export class AdminNotification {
  @Prop({ type: String, enum: AdminNotificationType, required: true, index: true })
  type!: AdminNotificationType;

  @Prop({ required: true, trim: true, maxlength: 160 })
  title!: string;

  @Prop({ required: true, trim: true, maxlength: 1000 })
  message!: string;

  @Prop({ type: String, default: '' })
  targetUrl!: string;

  @Prop({ type: Types.ObjectId, default: null })
  relatedEntityId!: Types.ObjectId | null;

  @Prop({ type: Boolean, default: false, index: true })
  isRead!: boolean;

  @Prop({ type: String, enum: ['low', 'medium', 'high'], default: 'medium' })
  priority!: 'low' | 'medium' | 'high';

  createdAt?: Date;
  updatedAt?: Date;
}

export const AdminNotificationSchema = SchemaFactory.createForClass(AdminNotification);
AdminNotificationSchema.index({ type: 1, relatedEntityId: 1 }, { unique: true, sparse: true });
