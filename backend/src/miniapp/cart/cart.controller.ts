import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MiniappCartService } from './cart.service';
import { AddCartDto } from './dto/add-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { MiniappAuthGuard } from '../auth/guards/miniapp-auth.guard';

@ApiTags('小程序-购物车')
@Controller('miniapp/cart')
@UseGuards(MiniappAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MiniappCartController {
  constructor(private readonly cartService: MiniappCartService) {}

  @Get()
  @ApiOperation({ summary: '获取购物车列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll(@Req() req) {
    return this.cartService.findAll(req.user.userId);
  }

  @Get('count')
  @ApiOperation({ summary: '获取购物车数量' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getCount(@Req() req) {
    return this.cartService.getCount(req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: '加入购物车' })
  @ApiResponse({ status: 201, description: '添加成功' })
  addToCart(@Req() req, @Body() addCartDto: AddCartDto) {
    return this.cartService.addToCart(req.user.userId, addCartDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新购物车' })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() updateCartDto: UpdateCartDto) {
    return this.cartService.update(req.user.userId, id, updateCartDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除购物车项' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.cartService.remove(req.user.userId, id);
  }

  @Delete()
  @ApiOperation({ summary: '清空购物车' })
  @ApiResponse({ status: 200, description: '清空成功' })
  clear(@Req() req) {
    return this.cartService.clear(req.user.userId);
  }
}

