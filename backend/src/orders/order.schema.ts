import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
export type OrderDocument = HydratedDocument<Order>;
@Schema({ _id: false })
export class OrderStatusEvent {
  @Prop({ required: true, enum: ['pending','confirmed','processing','shipped','delivered','cancelled'] }) status!: string;
  @Prop({ required: true, default: Date.now }) changedAt!: Date;
  @Prop({ required: true, enum: ['system','seller','admin'] }) changedBy!: string;
  @Prop({ trim: true }) note?: string;
}
const OrderStatusEventSchema = SchemaFactory.createForClass(OrderStatusEvent);
@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true }) productId!: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true }) sellerId!: Types.ObjectId;
  @Prop({ required: true }) name!: string;
  @Prop({ required: true, min: 0 }) unitPrice!: number;
  @Prop({ required: true, min: 1 }) quantity!: number;
  @Prop({ required: true, min: 0 }) lineTotal!: number;
  @Prop({ required: true, default: 'pending', enum: ['pending','confirmed','processing','shipped','delivered','cancelled'] }) status!: string;
}
const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true }) customer!: Types.ObjectId;
  @Prop({ type: [OrderItemSchema], required: true }) items!: OrderItem[];
  @Prop({ type: [OrderStatusEventSchema], default: [] }) statusHistory!: OrderStatusEvent[];
  @Prop({ required: true, min: 0 }) total!: number;
  @Prop({ required: true, trim: true }) customerName!: string;
  @Prop({ required: true, trim: true }) phone!: string;
  @Prop({ required: true, trim: true }) address!: string;
  @Prop({ required: true, trim: true }) city!: string;
  @Prop({ required: true, default: 'cash_on_delivery' }) paymentMethod!: string;
  @Prop({ required: true, default: 'pending', enum: ['pending','confirmed','processing','shipped','delivered','cancelled'] }) status!: string;
  createdAt?: Date; updatedAt?: Date;
}
export const OrderSchema = SchemaFactory.createForClass(Order);
