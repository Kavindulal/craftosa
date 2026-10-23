
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SellerDocument = HydratedDocument<Seller>;

export enum SellerStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class Seller {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  })
  user!: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  })
  shopName!: string;

  @Prop({
    required: true,
    trim: true,
    minlength: 20,
    maxlength: 1000,
  })
  bio!: string;

  @Prop({ type: [String], required: true })
  craftTypes!: string[];

  @Prop({
    required: true,
    trim: true,
    maxlength: 100,
  })
  city!: string;

  @Prop({ type: String, trim: true, maxlength: 2048, default: '' })
  profileImageUrl!: string;

  @Prop({ type: String, trim: true, maxlength: 2048, default: '' })
  coverImageUrl!: string;


  @Prop({
    type: String,
    enum: SellerStatus,
    default: SellerStatus.PENDING,
    required: true,
    index: true,
  })
  status!: SellerStatus;

  @Prop({
    type: String,
    trim: true,
    maxlength: 500,
    default: null,
  })
  rejectionReason!: string | null;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    default: null,
  })
  reviewedBy!: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  reviewedAt!: Date | null;

  // Automatically managed by Mongoose timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export const SellerSchema = SchemaFactory.createForClass(Seller);
