import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument, ProductStatus } from '../products/product.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Order, OrderDocument } from './order.schema';
import { Notification, NotificationDocument } from './notification.schema';
@Injectable()
export class OrdersService {
  constructor(@InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>, @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>, @InjectModel(Notification.name) private readonly notificationModel: Model<NotificationDocument>) {}
  async create(customerId: string, dto: CreateOrderDto) {
    if (!Types.ObjectId.isValid(customerId)) throw new BadRequestException('Invalid customer ID');
    const merged = new Map<string, number>();
    for (const item of dto.items) merged.set(item.productId, (merged.get(item.productId) || 0) + item.quantity);
    const items: any[] = [];
    for (const [id, quantity] of merged) {
      const product = await this.productModel.findOne({ _id: new Types.ObjectId(id), status: ProductStatus.ACTIVE }).exec();
      if (!product) throw new NotFoundException('One of the products is no longer available');
      if (!Number.isInteger(quantity) || quantity < 1 || product.stock < quantity) throw new BadRequestException(`Not enough stock for ${product.name}`);
      items.push({ productId: product._id, sellerId: product.seller, name: product.name, unitPrice: product.price, quantity, lineTotal: Number((product.price * quantity).toFixed(2)), status: 'pending' });
    }
    const reserved: { id: Types.ObjectId; quantity: number }[] = [];
    try {
      for (const item of items) {
        const updated = await this.productModel.findOneAndUpdate({ _id: item.productId, status: ProductStatus.ACTIVE, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } }, { new: true }).exec();
        if (!updated) throw new BadRequestException(`Stock changed while ordering ${item.name}. Please try again.`);
        reserved.push({ id: item.productId, quantity: item.quantity });
      }
      const total = Number(items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));
      const order = await this.orderModel.create({ customer: new Types.ObjectId(customerId), items, total, customerName: dto.customerName.trim(), phone: dto.phone.trim(), address: dto.address.trim(), city: dto.city.trim(), paymentMethod: 'cash_on_delivery', status: 'pending', statusHistory: [{ status: 'pending', changedAt: new Date(), changedBy: 'system', note: 'Order placed successfully' }] });
      try {
        await this.notificationModel.create({ recipient: order.customer, role: 'customer', orderId: order._id, title: 'Order placed', message: 'Your order was placed successfully.', status: 'pending' });
        const sellerIds = [...new Set(items.map(item => String(item.sellerId)))];
        if (sellerIds.length) await this.notificationModel.insertMany(sellerIds.map(sellerId => ({ recipient: new Types.ObjectId(sellerId), role: 'seller', orderId: order._id, title: 'New order received', message: `A new order from ${order.customerName} includes products from your shop.`, status: 'pending' })));
      } catch { /* A notification failure must not undo a successfully created order. */ }
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
  async findSellerOrders(sellerId: string) {
    if (!Types.ObjectId.isValid(sellerId)) throw new BadRequestException('Invalid seller ID');
    const orders = await this.orderModel.find().sort({ createdAt: -1 }).exec();
    const visible: any[] = [];
    for (const order of orders) {
      let changed = false;
      for (const item of order.items) if (!item.sellerId) { const product = await this.productModel.findById(item.productId).select('seller').exec(); if (product) { item.sellerId = product.seller; changed = true; } }
      if (changed) await order.save();
      const ownItems = order.items.filter(item => item.sellerId?.toString() === sellerId);
      if (ownItems.length) visible.push({ ...order.toObject(), items: ownItems, sellerSubtotal: ownItems.reduce((sum, item) => sum + item.lineTotal, 0) });
    }
    return visible;
  }
  async updateSellerItemStatus(sellerId: string, orderId: string, dto: UpdateOrderStatusDto) {
    if (!Types.ObjectId.isValid(sellerId) || !Types.ObjectId.isValid(orderId)) throw new BadRequestException('Invalid seller or order ID');
    if (!['confirmed','processing','shipped','delivered'].includes(dto.status)) throw new BadRequestException('Seller can set status to confirmed, processing, shipped, or delivered');
    const order = await this.orderModel.findOne({ _id: new Types.ObjectId(orderId), 'items.sellerId': new Types.ObjectId(sellerId) }).exec();
    if (!order) throw new NotFoundException('Order not found for your shop');
    let matched = false;
    for (const item of order.items) if (item.sellerId?.toString() === sellerId) { item.status = dto.status; matched = true; }
    if (!matched) throw new ForbiddenException('This order has no items from your shop');
    const statuses = order.items.map(item => item.status);
    const nextOverall = statuses.every(status => status === statuses[0]) ? statuses[0] : 'processing';
    if (order.status !== nextOverall) {
      order.status = nextOverall;
      order.statusHistory.push({ status: nextOverall, changedAt: new Date(), changedBy: 'seller', note: `Seller updated order status to ${nextOverall}` } as any);
    } else {
      order.statusHistory.push({ status: dto.status, changedAt: new Date(), changedBy: 'seller', note: `Seller updated item status to ${dto.status}` } as any);
    }
    await order.save();
    await this.notificationModel.create({ recipient: order.customer, role: 'customer', orderId: order._id, title: 'Order status updated', message: `Your order status is now ${order.status}.`, status: order.status });
    return { message: 'Order status updated', order };
  }
  async getSellerAnalytics(sellerId: string) {
    if (!Types.ObjectId.isValid(sellerId)) throw new BadRequestException('Invalid seller ID');
    const [products, orders] = await Promise.all([
      this.productModel.find({ seller: new Types.ObjectId(sellerId) }).select('status stock name').lean().exec(),
      this.orderModel.find({ 'items.sellerId': new Types.ObjectId(sellerId) }).sort({ createdAt: -1 }).lean().exec(),
    ]);
    const sellerOrders = orders.map(order => {
      const items = (order.items || []).filter((item: any) => String(item.sellerId) === sellerId);
      return { ...order, items, sellerSubtotal: Number(items.reduce((sum: number, item: any) => sum + Number(item.lineTotal || 0), 0).toFixed(2)) };
    }).filter(order => order.items.length > 0);
    const activeStatuses = ['pending', 'confirmed', 'processing', 'shipped'];
    const deliveredOrders = sellerOrders.filter(order => order.status === 'delivered');
    const revenue = deliveredOrders.reduce((sum, order) => sum + order.sellerSubtotal, 0);
    const monthly = new Map<string, { month: string; sales: number; orders: number }>();
    for (const order of deliveredOrders) {
      const date = new Date(order.updatedAt || order.createdAt || Date.now());
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en', { month: 'short', year: '2-digit' });
      const current = monthly.get(key) || { month: label, sales: 0, orders: 0 };
      current.sales += order.sellerSubtotal;
      current.orders += 1;
      monthly.set(key, current);
    }
    const recentOrders = sellerOrders.slice(0, 5).map(order => ({
      id: String(order._id),
      customerName: order.customerName,
      status: order.status,
      createdAt: order.createdAt,
      sellerSubtotal: order.sellerSubtotal,
      itemCount: order.items.reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0),
    }));
    return {
      totalProducts: products.length,
      activeProducts: products.filter((product: any) => product.status === ProductStatus.ACTIVE).length,
      outOfStockProducts: products.filter((product: any) => Number(product.stock || 0) === 0).length,
      totalOrders: sellerOrders.length,
      activeOrders: sellerOrders.filter(order => activeStatuses.includes(order.status)).length,
      pendingOrders: sellerOrders.filter(order => order.status === 'pending').length,
      deliveredOrders: deliveredOrders.length,
      revenue: Number(revenue.toFixed(2)),
      monthlySales: [...monthly.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-6).map(([, value]) => ({ ...value, sales: Number(value.sales.toFixed(2)) })),
      recentOrders,
    };
  }
  async findAll() { return this.orderModel.find().sort({ createdAt: -1 }).lean().exec(); }
  async updateAdminStatus(orderId: string, dto: UpdateOrderStatusDto) {
    if (!Types.ObjectId.isValid(orderId)) throw new BadRequestException('Invalid order ID');
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) throw new NotFoundException('Order not found');
    const statusChanged = order.status !== dto.status;
    if (statusChanged) {
      order.status = dto.status;
      for (const item of order.items) item.status = dto.status;
      order.statusHistory.push({ status: dto.status, changedAt: new Date(), changedBy: 'admin', note: `Admin updated order status to ${dto.status}` } as any);
    }
    await order.save();
    if (statusChanged) await this.notificationModel.create({ recipient: order.customer, role: 'customer', orderId: order._id, title: 'Order status updated', message: `Your order status is now ${order.status}.`, status: order.status });
    return { message: 'Order status updated', order };
  }
  async findNotifications(userId: string, role: string) {
    if (!Types.ObjectId.isValid(userId)) throw new BadRequestException('Invalid user ID');
    return this.notificationModel.find({ recipient: new Types.ObjectId(userId), role }).sort({ createdAt: -1 }).limit(100).lean().exec();
  }
  async markNotificationRead(userId: string, role: string, notificationId: string) {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(notificationId)) throw new BadRequestException('Invalid user or notification ID');
    const result = await this.notificationModel.findOneAndUpdate({ _id: new Types.ObjectId(notificationId), recipient: new Types.ObjectId(userId), role }, { $set: { read: true } }, { new: true }).lean().exec();
    if (!result) throw new NotFoundException('Notification not found');
    return result;
  }
  async markAllNotificationsRead(userId: string, role: string) {
    if (!Types.ObjectId.isValid(userId)) throw new BadRequestException('Invalid user ID');
    await this.notificationModel.updateMany({ recipient: new Types.ObjectId(userId), role, read: false }, { $set: { read: true } }).exec();
    return { message: 'All notifications marked as read' };
  }
}
