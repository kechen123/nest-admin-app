import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MiniappProductService } from './product.service';
import { QueryProductDto } from './dto/query-product.dto';

@ApiTags('小程序-商品')
@Controller('miniapp/products')
export class MiniappProductController {
  constructor(private readonly productService: MiniappProductService) {}

  @Get()
  @ApiOperation({ summary: '获取商品列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll(@Query() queryDto: QueryProductDto) {
    return this.productService.findAll(queryDto);
  }

  @Get('recommend')
  @ApiOperation({ summary: '获取推荐商品' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getRecommend(@Query() queryDto: QueryProductDto) {
    return this.productService.getRecommendProducts(queryDto.page, queryDto.pageSize);
  }

  @Get('new')
  @ApiOperation({ summary: '获取新品' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getNew(@Query('limit') limit?: number) {
    return this.productService.getNewProducts(limit);
  }

  @Get('categories')
  @ApiOperation({ summary: '获取分类列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getCategories() {
    return this.productService.getCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取商品详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }
}

