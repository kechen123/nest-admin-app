import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductSkuDto } from '../../product-sku/dto/create-product-sku.dto';

export class CreateProductDto {
  @ApiProperty({ description: '商品名称', example: 'iPhone 15 Pro Max' })
  @IsString()
  @IsNotEmpty({ message: '商品名称不能为空' })
  name: string;

  @ApiProperty({ description: '商品副标题', required: false })
  @IsString()
  @IsOptional()
  subtitle?: string;

  @ApiProperty({ description: '分类ID' })
  @IsInt()
  @Min(1)
  categoryId: number;

  @ApiProperty({ description: '商品主图', required: false })
  @IsString()
  @IsOptional()
  mainImage?: string;

  @ApiProperty({ description: '商品详情（富文本）', required: false })
  @IsString()
  @IsOptional()
  detail?: string;

  @ApiProperty({ description: '排序值', example: 0, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @ApiProperty({ description: '是否推荐: 0-否, 1-是', example: 0, default: 0 })
  @IsInt()
  @Min(0)
  @Max(1)
  @IsOptional()
  isRecommend?: number;

  @ApiProperty({ description: '是否新品: 0-否, 1-是', example: 0, default: 0 })
  @IsInt()
  @Min(0)
  @Max(1)
  @IsOptional()
  isNew?: number;

  @ApiProperty({ description: '状态: 0-下架, 1-上架', example: 1, default: 1 })
  @IsInt()
  @Min(0)
  @Max(1)
  @IsOptional()
  status?: number;

  @ApiProperty({ description: '商品规格列表', type: [CreateProductSkuDto], required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateProductSkuDto)
  skus?: Omit<CreateProductSkuDto, 'productId'>[];
}

