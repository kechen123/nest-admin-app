import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MiniappOrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { MiniappAuthGuard } from '../auth/guards/miniapp-auth.guard';

@ApiTags('小程序-订单')
@Controller('miniapp/orders')
@UseGuards(MiniappAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MiniappOrderController {
  constructor(private readonly orderService: MiniappOrderService) {}

  @Post()
  @ApiOperation({ summary: '创建订单' })
  @ApiResponse({ status: 201, description: '创建成功' })
  create(@Req() req, @Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(req.user.userId, createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: '获取订单列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll(@Req() req, @Query('status') status?: number) {
    return this.orderService.findAll(req.user.userId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取订单详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findOne(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.orderService.findOne(req.user.userId, id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: '取消订单' })
  @ApiResponse({ status: 200, description: '取消成功' })
  cancel(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.orderService.cancel(req.user.userId, id);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: '确认收货' })
  @ApiResponse({ status: 200, description: '确认成功' })
  confirm(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.orderService.confirm(req.user.userId, id);
  }
}

