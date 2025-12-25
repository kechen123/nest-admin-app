import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateProductStatusDto } from './dto/update-product-status.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination.dto';
import { Product } from '../../../common/entities/mall/product.entity';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('商品管理')
@Controller('mall/products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: '创建商品' })
  @ApiResponse({ status: 201, type: Product })
  create(@Body() createProductDto: CreateProductDto, @Req() req: Request) {
    return this.productService.create(createProductDto, req);
  }

  @Get()
  @ApiOperation({ summary: '分页查询商品列表' })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  findAll(@Query() queryDto: QueryProductDto) {
    return this.productService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询商品' })
  @ApiResponse({ status: 200, type: Product })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新商品' })
  @ApiResponse({ status: 200, type: Product })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: Request,
  ) {
    return this.productService.update(id, updateProductDto, req);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '更新商品状态（上架/下架）' })
  @ApiResponse({ status: 200, type: Product })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateProductStatusDto,
    @Req() req: Request,
  ) {
    return this.productService.updateStatus(id, updateStatusDto.status, req);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除商品' })
  @ApiResponse({ status: 200 })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.productService.remove(id, req);
  }
}

