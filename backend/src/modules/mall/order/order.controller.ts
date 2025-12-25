import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Body,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { QueryOrderDto } from './dto/query-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination.dto';
import { Order } from '../../../common/entities/mall/order.entity';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('订单管理')
@Controller('mall/orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: '分页查询订单列表' })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  findAll(@Query() queryDto: QueryOrderDto) {
    return this.orderService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询订单详情' })
  @ApiResponse({ status: 200, type: Order })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.findOne(id);
  }

  @Get('order-no/:orderNo')
  @ApiOperation({ summary: '根据订单号查询订单详情' })
  @ApiResponse({ status: 200, type: Order })
  findByOrderNo(@Param('orderNo') orderNo: string) {
    return this.orderService.findByOrderNo(orderNo);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '更新订单状态' })
  @ApiResponse({ status: 200, type: Order })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateOrderStatusDto,
    @Req() req: Request,
  ) {
    return this.orderService.updateStatus(id, updateStatusDto.status, req);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: '取消订单' })
  @ApiResponse({ status: 200, type: Order })
  cancel(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.orderService.cancel(id, req);
  }

  @Patch(':id/ship')
  @ApiOperation({ summary: '订单发货' })
  @ApiResponse({ status: 200, type: Order })
  ship(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.orderService.ship(id, req);
  }
}

