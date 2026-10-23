import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/roles.guard';
import { Product, ProductSchema } from '../products/product.schema';
import { Seller, SellerSchema } from '../sellers/seller.schema';
import { Notification, NotificationSchema } from '../orders/notification.schema';
import { ChatController } from './chat.controller';
import { ChatConversation, ChatConversationSchema } from './chat-conversation.schema';
import { ChatMessage, ChatMessageSchema } from './chat-message.schema';
import { ChatService } from './chat.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: ChatConversation.name, schema: ChatConversationSchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Seller.name, schema: SellerSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService, RolesGuard],
})
export class ChatModule {}
