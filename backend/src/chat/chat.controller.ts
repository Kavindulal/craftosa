import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ChatService } from './chat.service';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string; role: string };
}

@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('customer', 'seller')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  list(@Req() req: AuthenticatedRequest) {
    return this.chatService.listConversations(req.user.userId, req.user.role);
  }

  @Post('conversations')
  @Roles('customer')
  start(@Req() req: AuthenticatedRequest, @Body() dto: { sellerId: string; productId?: string }) {
    return this.chatService.startConversation(req.user.userId, req.user.role, dto);
  }

  @Get('conversations/:id/messages')
  messages(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.chatService.getMessages(id, req.user.userId, req.user.role);
  }

  @Post('conversations/:id/messages')
  send(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: { body: string }) {
    return this.chatService.sendMessage(id, req.user.userId, req.user.role, dto.body);
  }
}
