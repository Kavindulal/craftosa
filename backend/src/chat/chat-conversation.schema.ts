import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ChatConversationDocument = HydratedDocument<ChatConversation>;

@Schema({ timestamps: true })
export class ChatConversation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  customerId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  sellerId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', default: null })
  productId!: Types.ObjectId | null;

  @Prop({ trim: true, maxlength: 2000, default: '' })
  lastMessage!: string;

  @Prop({ type: Date, default: Date.now, index: true })
  lastMessageAt!: Date;

  @Prop({ type: Number, default: 0, min: 0 })
  customerUnreadCount!: number;

  @Prop({ type: Number, default: 0, min: 0 })
  sellerUnreadCount!: number;
}

export const ChatConversationSchema = SchemaFactory.createForClass(ChatConversation);
ChatConversationSchema.index({ customerId: 1, sellerId: 1, productId: 1 }, { unique: true });
ChatConversationSchema.index({ customerId: 1, lastMessageAt: -1 });
ChatConversationSchema.index({ sellerId: 1, lastMessageAt: -1 });
