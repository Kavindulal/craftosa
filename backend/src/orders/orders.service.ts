import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument, ProductStatus } from '../products/product.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderDocument } from './order.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(customerId: string, dto: CreateOrderDto) {
    if (!Types.ObjectId.isValid(customerId)) throw new BadRequestException('Invalid customer ID');
    const merged = new Map<string, number>();
    for (const item of dto.items) merged.set(item.productId, (merged.get(item.productId) || 0) + item.quantity);
    const items: { productId: Types.ObjectId; name: string; unitPrice: number; quantity: number; lineTotal: number }[] = [];
    for (const [id, quantity] of merged) {
      const product = await this.productModel.findOne({ _id: new Types.ObjectId(id), status: ProductStatus.ACTIVE }).exec();
      if (!product) throw new NotFoundException('One of the products is no longer available');
      if (!Number.isInteger(quantity) || quantity < 1 || product.stock < quantity) throw new BadRequestException(`Not enough stock for ${product.name}`);
      items.push({ productId: product._id, name: product.name, unitPrice: product.price, quantity, lineTotal: Number((product.price * quantity).toFixed(2)) });
    }

    const reserved: { id: Types.ObjectId; quantity: number }[] = [];
    try {
      for (const item of items) {
        const updated = await this.productModel.findOneAndUpdate(
          { _id: item.productId, status: ProductStatus.ACTIVE, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true },
        ).exec();
        if (!updated) throw new BadRequestException(`Stock changed while ordering ${item.name}. Please try again.`);
        reserved.push({ id: item.productId, quantity: item.quantity });
      }
      const total = Number(items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));
      const order = await this.orderModel.create({
        customer: new Types.ObjectId(customerId), items, total,
        customerName: dto.customerName.trim(), phone: dto.phone.trim(),
        address: dto.address.trim(), city: dto.city.trim(),
        paymentMethod: 'cash_on_delivery', status: 'pending',
      });
      return { message: 'Order placed successfully', order: { id: order._id, total: order.total, status: order.status, paymentMethod: order.paymentMethod, items: order.items, createdAt: order.createdAt } };
    } catch (error) {
      await Promise.all(reserved.map(item => this.productModel.updateOne({ _id: item.id }, { $inc: { stock: item.quantity } }).exec()));
      throw error;
    }
  }

  async findMine(customerId: string) {
    if (!Types.ObjectId.isValid(customerId)) throw new BadRequestException('Invalid customer ID');
    return this.orderModel.find({ customer: new Types.ObjectId(customerId) }).sort({ createdAt: -1 }).lean().exec();
  }
}
