import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
  productId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  customerId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order', required: true, index: true })
  orderId!: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating!: number;

  @Prop({ required: true, trim: true, minlength: 3, maxlength: 1000 })
  comment!: string;

  @Prop({ trim: true, maxlength: 120 })
  customerName?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
ReviewSchema.index({ productId: 1, customerId: 1, orderId: 1 }, { unique: true });
ReviewSchema.index({ productId: 1, createdAt: -1 });
