import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MiniappAddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { MiniappAuthGuard } from '../auth/guards/miniapp-auth.guard';

@ApiTags('小程序-收货地址')
@Controller('miniapp/addresses')
@UseGuards(MiniappAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MiniappAddressController {
  constructor(private readonly addressService: MiniappAddressService) {}

  @Get()
  @ApiOperation({ summary: '获取地址列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll(@Req() req) {
    return this.addressService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取地址详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findOne(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.addressService.findOne(req.user.userId, id);
  }

  @Post()
  @ApiOperation({ summary: '创建地址' })
  @ApiResponse({ status: 201, description: '创建成功' })
  create(@Req() req, @Body() createAddressDto: CreateAddressDto) {
    return this.addressService.create(req.user.userId, createAddressDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新地址' })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() updateData: Partial<CreateAddressDto>) {
    return this.addressService.update(req.user.userId, id, updateData);
  }

  @Patch(':id/default')
  @ApiOperation({ summary: '设置默认地址' })
  @ApiResponse({ status: 200, description: '设置成功' })
  setDefault(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.addressService.setDefault(req.user.userId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除地址' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.addressService.remove(req.user.userId, id);
  }
}

