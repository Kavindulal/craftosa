import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

interface AuthenticatedRequest extends Request { user: { userId: string; email: string; role: string } }

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('customer')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(req.user.userId, dto);
  }
  @Get('mine')
  findMine(@Req() req: AuthenticatedRequest) {
    return this.ordersService.findMine(req.user.userId);
  }
}
