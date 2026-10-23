import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  recipient!: Types.ObjectId;

  @Prop({ required: true, enum: ['customer', 'seller', 'admin'], index: true })
  role!: string;

  @Prop({ type: Types.ObjectId, ref: 'Order', required: false, default: null, index: true })
  orderId!: Types.ObjectId | null;

  @Prop({ type: String, enum: ['order', 'chat'], default: 'order', index: true })
  type!: 'order' | 'chat';

  @Prop({ type: Types.ObjectId, ref: 'ChatConversation', default: null, index: true })
  conversationId!: Types.ObjectId | null;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true })
  message!: string;

  @Prop({ required: true, default: false, index: true })
  read!: boolean;

  @Prop({ trim: true })
  status?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ recipient: 1, role: 1, read: 1, createdAt: -1 });
