import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';
interface AuthenticatedRequest extends Request { user: { userId: string; email: string; role: string } }
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
  @Post() @Roles('customer')
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateOrderDto) { return this.ordersService.create(req.user.userId, dto); }
  @Get('mine') @Roles('customer')
  findMine(@Req() req: AuthenticatedRequest) { return this.ordersService.findMine(req.user.userId); }
  @Get('seller') @Roles('seller')
  findSellerOrders(@Req() req: AuthenticatedRequest) { return this.ordersService.findSellerOrders(req.user.userId); }
  @Patch('seller/:orderId/status') @Roles('seller')
  updateSellerItemStatus(@Req() req: AuthenticatedRequest, @Param('orderId') orderId: string, @Body() dto: UpdateOrderStatusDto) { return this.ordersService.updateSellerItemStatus(req.user.userId, orderId, dto); }
  @Get('admin') @Roles('admin')
  findAll() { return this.ordersService.findAll(); }
  @Patch('admin/:orderId/status') @Roles('admin')
  updateAdminStatus(@Param('orderId') orderId: string, @Body() dto: UpdateOrderStatusDto) { return this.ordersService.updateAdminStatus(orderId, dto); }
}
