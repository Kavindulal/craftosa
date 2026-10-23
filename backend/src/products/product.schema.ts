
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  seller!: Types.ObjectId;

  @Prop({ required: true, trim: true, minlength: 2, maxlength: 120 })
  name!: string;

  @Prop({ required: true, trim: true, minlength: 10, maxlength: 2000 })
  description!: string;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop({ required: true, trim: true, maxlength: 60 })
  category!: string;

  @Prop({ required: true, min: 0, default: 0 })
  stock!: number;

  @Prop({ required: true, trim: true })
  imageUrl!: string;

  @Prop({ type: [String], default: [] })
  imageUrls!: string[];

  @Prop({ trim: true, maxlength: 200 })
  materials?: string;

  @Prop({ trim: true, maxlength: 100 })
  dimensions?: string;

  @Prop({ trim: true, maxlength: 100 })
  weight?: string;

  @Prop({ trim: true, maxlength: 1000 })
  careInstructions?: string;

  @Prop({ type: Boolean, default: false })
  madeToOrder!: boolean;

  @Prop({
    type: String,
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
    index: true,
  })
  status!: ProductStatus;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ seller: 1, createdAt: -1 });
ProductSchema.index({ name: 'text', description: 'text', category: 'text' });
