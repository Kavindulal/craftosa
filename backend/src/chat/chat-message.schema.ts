import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ChatMessageDocument = HydratedDocument<ChatMessage>;

@Schema({ timestamps: true })
export class ChatMessage {
  @Prop({ type: Types.ObjectId, ref: 'ChatConversation', required: true, index: true })
  conversationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  senderId!: Types.ObjectId;

  @Prop({ type: String, enum: ['customer', 'seller'], required: true })
  senderRole!: 'customer' | 'seller';

  @Prop({ required: true, trim: true, minlength: 1, maxlength: 2000 })
  body!: string;

  @Prop({ type: Date, default: null })
  readAt!: Date | null;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
ChatMessageSchema.index({ conversationId: 1, createdAt: 1 });
