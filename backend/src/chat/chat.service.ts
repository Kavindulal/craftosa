import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatConversation, ChatConversationDocument } from './chat-conversation.schema';
import { ChatMessage, ChatMessageDocument } from './chat-message.schema';
import { Product, ProductDocument, ProductStatus } from '../products/product.schema';
import { Seller, SellerDocument, SellerStatus } from '../sellers/seller.schema';
import { Notification, NotificationDocument } from '../orders/notification.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatConversation.name) private readonly conversationModel: Model<ChatConversationDocument>,
    @InjectModel(ChatMessage.name) private readonly messageModel: Model<ChatMessageDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Seller.name) private readonly sellerModel: Model<SellerDocument>,
    @InjectModel(Notification.name) private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  private async getConversationForParticipant(conversationId: string, userId: string) {
    if (!Types.ObjectId.isValid(conversationId) || !Types.ObjectId.isValid(userId)) throw new BadRequestException('Invalid conversation or user ID');
    const conversation = await this.conversationModel.findById(conversationId).exec();
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (![String(conversation.customerId), String(conversation.sellerId)].includes(userId)) throw new ForbiddenException('You are not a participant in this conversation');
    return conversation;
  }

  async listConversations(userId: string, role: string) {
    if (!Types.ObjectId.isValid(userId)) throw new BadRequestException('Invalid user ID');
    if (!['customer', 'seller'].includes(role)) throw new ForbiddenException('Chat is available for customer and seller accounts');
    const filter = role === 'customer' ? { customerId: new Types.ObjectId(userId) } : { sellerId: new Types.ObjectId(userId) };
    const conversations = await this.conversationModel.find(filter).sort({ lastMessageAt: -1 }).populate('customerId', 'name').populate('sellerId', 'name').populate('productId', 'name imageUrl price').lean().exec();
    return conversations.map((item: any) => ({
      ...item,
      otherParticipant: role === 'customer' ? item.sellerId : item.customerId,
      unreadCount: role === 'customer' ? item.customerUnreadCount : item.sellerUnreadCount,
    }));
  }

  async startConversation(customerId: string, role: string, dto: { sellerId: string; productId?: string }) {
    if (role !== 'customer') throw new ForbiddenException('Only customers can start a conversation with a seller');
    if (!Types.ObjectId.isValid(customerId) || !Types.ObjectId.isValid(dto.sellerId)) throw new BadRequestException('Invalid customer or seller ID');
    if (customerId === dto.sellerId) throw new BadRequestException('You cannot message your own account');
    const seller = await this.sellerModel.findOne({ user: new Types.ObjectId(dto.sellerId), status: SellerStatus.APPROVED }).select('_id user').lean().exec();
    if (!seller) throw new NotFoundException('This seller shop is not available');
    let productId: Types.ObjectId | null = null;
    if (dto.productId) {
      if (!Types.ObjectId.isValid(dto.productId)) throw new BadRequestException('Invalid product ID');
      const product = await this.productModel.findOne({ _id: new Types.ObjectId(dto.productId), seller: new Types.ObjectId(dto.sellerId), status: ProductStatus.ACTIVE }).select('_id').lean().exec();
      if (!product) throw new BadRequestException('The selected product is not available from this seller');
      productId = new Types.ObjectId(dto.productId);
    }
    const filter = { customerId: new Types.ObjectId(customerId), sellerId: new Types.ObjectId(dto.sellerId), productId };
    const existing = await this.conversationModel.findOne(filter).exec();
    if (existing) return { conversationId: String(existing._id), existing: true };
    try {
      const conversation = await this.conversationModel.create({ ...filter, lastMessage: '', lastMessageAt: new Date() });
      return { conversationId: String(conversation._id), existing: false };
    } catch (error: any) {
      if (error?.code === 11000) {
        const existingAfterRace = await this.conversationModel.findOne(filter).exec();
        if (existingAfterRace) return { conversationId: String(existingAfterRace._id), existing: true };
      }
      throw error;
    }
  }

  async getMessages(conversationId: string, userId: string, role: string) {
    const conversation = await this.getConversationForParticipant(conversationId, userId);
    if (!['customer', 'seller'].includes(role)) throw new ForbiddenException('Chat is available for customer and seller accounts');
    const unreadField = role === 'customer' ? 'customerUnreadCount' : 'sellerUnreadCount';
    await this.conversationModel.updateOne({ _id: conversation._id }, { $set: { [unreadField]: 0 } }).exec();
    await this.messageModel.updateMany({ conversationId: conversation._id, senderId: { $ne: new Types.ObjectId(userId) }, readAt: null }, { $set: { readAt: new Date() } }).exec();
    const messages = await this.messageModel.find({ conversationId: conversation._id }).sort({ createdAt: 1 }).limit(300).populate('senderId', 'name').lean().exec();
    return { conversationId: String(conversation._id), messages };
  }

  async sendMessage(conversationId: string, userId: string, role: string, rawBody: string) {
    const conversation = await this.getConversationForParticipant(conversationId, userId);
    const senderRole: 'customer' | 'seller' | null = role === 'customer' ? 'customer' : role === 'seller' ? 'seller' : null;
    if (!senderRole) throw new ForbiddenException('Chat is available for customer and seller accounts');
    const body = String(rawBody || '').trim();
    if (!body || body.length > 2000) throw new BadRequestException('Message must be between 1 and 2000 characters');
    const message = await this.messageModel.create({ conversationId: conversation._id, senderId: new Types.ObjectId(userId), senderRole, body, readAt: null });
    const isCustomer = senderRole === 'customer';
    const recipientId = isCustomer ? conversation.sellerId : conversation.customerId;
    const recipientRole = isCustomer ? 'seller' : 'customer';
    await this.conversationModel.updateOne({ _id: conversation._id }, { $set: { lastMessage: body, lastMessageAt: new Date() }, $inc: { [isCustomer ? 'sellerUnreadCount' : 'customerUnreadCount']: 1 } }).exec();
    try {
      await this.notificationModel.create({
        recipient: recipientId,
        role: recipientRole,
        type: 'chat',
        conversationId: conversation._id,
        title: isCustomer ? 'New message from a customer' : 'New message from a seller',
        message: body.length > 120 ? `${body.slice(0, 117)}...` : body,
        read: false,
      });
    } catch { /* A notification failure must not prevent message delivery. */ }
    return message;
  }
}
