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
import { ProductSkuService } from './product-sku.service';
import { CreateProductSkuDto } from './dto/create-product-sku.dto';
import { UpdateProductSkuDto } from './dto/update-product-sku.dto';
import { QueryProductSkuDto } from './dto/query-product-sku.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination.dto';
import { ProductSku } from '../../../common/entities/mall/product-sku.entity';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('商品规格管理')
@Controller('mall/product-skus')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ProductSkuController {
  constructor(private readonly skuService: ProductSkuService) {}

  @Post()
  @ApiOperation({ summary: '创建商品规格' })
  @ApiResponse({ status: 201, type: ProductSku })
  create(@Body() createSkuDto: CreateProductSkuDto, @Req() req: Request) {
    return this.skuService.create(createSkuDto, req);
  }

  @Post('batch')
  @ApiOperation({ summary: '批量创建商品规格' })
  @ApiResponse({ status: 201, type: [ProductSku] })
  createBatch(
    @Body() body: { productId: number; skus: CreateProductSkuDto[] },
    @Req() req: Request,
  ) {
    return this.skuService.createBatch(body.productId, body.skus, req);
  }

  @Get()
  @ApiOperation({ summary: '分页查询商品规格列表' })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  findAll(@Query() queryDto: QueryProductSkuDto) {
    return this.skuService.findAll(queryDto);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: '根据商品ID查询所有规格' })
  @ApiResponse({ status: 200, type: [ProductSku] })
  findByProductId(@Param('productId', ParseIntPipe) productId: number) {
    return this.skuService.findByProductId(productId);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询商品规格' })
  @ApiResponse({ status: 200, type: ProductSku })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.skuService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新商品规格' })
  @ApiResponse({ status: 200, type: ProductSku })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSkuDto: UpdateProductSkuDto,
    @Req() req: Request,
  ) {
    return this.skuService.update(id, updateSkuDto, req);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '更新商品规格状态（启用/禁用）' })
  @ApiResponse({ status: 200, type: ProductSku })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', ParseIntPipe) status: number,
    @Req() req: Request,
  ) {
    return this.skuService.updateStatus(id, status, req);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除商品规格' })
  @ApiResponse({ status: 200 })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.skuService.remove(id, req);
  }
}

