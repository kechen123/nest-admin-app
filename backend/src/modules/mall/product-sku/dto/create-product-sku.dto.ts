import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, IsNumber, Min, Max } from 'class-validator';

export class CreateProductSkuDto {
  @ApiProperty({ description: '商品ID' })
  @IsInt()
  @Min(1)
  productId: number;

  @ApiProperty({ description: 'SKU编码', example: 'IPHONE15PM-256-BLACK' })
  @IsString()
  @IsNotEmpty({ message: 'SKU编码不能为空' })
  skuCode: string;

  @ApiProperty({ description: '规格名称', example: '256GB 深空黑色' })
  @IsString()
  @IsNotEmpty({ message: '规格名称不能为空' })
  specName: string;

  @ApiProperty({ description: '规格值（JSON格式）', example: '{"storage":"256GB","color":"深空黑色"}' })
  @IsString()
  @IsNotEmpty({ message: '规格值不能为空' })
  specValues: string;

  @ApiProperty({ description: '价格（元）', example: 9999.00 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: '原价（元）', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  originalPrice?: number;

  @ApiProperty({ description: '库存', example: 100, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiProperty({ description: 'SKU图片', required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ description: '状态: 0-禁用, 1-启用', example: 1, default: 1 })
  @IsInt()
  @Min(0)
  @Max(1)
  @IsOptional()
  status?: number;
}

