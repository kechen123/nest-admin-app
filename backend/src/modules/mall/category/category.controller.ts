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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination.dto';
import { Category } from '../../../common/entities/mall/category.entity';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('商品分类管理')
@Controller('mall/categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: '创建分类' })
  @ApiResponse({ status: 201, type: Category })
  create(@Body() createCategoryDto: CreateCategoryDto, @Req() req: Request) {
    return this.categoryService.create(createCategoryDto, req);
  }

  @Get()
  @ApiOperation({ summary: '分页查询分类列表' })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  findAll(@Query() queryDto: QueryCategoryDto) {
    return this.categoryService.findAll(queryDto);
  }

  @Get('tree')
  @ApiOperation({ summary: '获取分类树' })
  @ApiResponse({ status: 200, type: [Category] })
  findTree() {
    return this.categoryService.findTree();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询分类' })
  @ApiResponse({ status: 200, type: Category })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新分类' })
  @ApiResponse({ status: 200, type: Category })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Req() req: Request,
  ) {
    return this.categoryService.update(id, updateCategoryDto, req);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除分类' })
  @ApiResponse({ status: 200 })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.categoryService.remove(id, req);
  }
}

