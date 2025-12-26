import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryProductSkuDto {
  @ApiProperty({ description: '页码', example: 1, default: 1, required: false })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiProperty({ description: '每页数量', example: 10, default: 10, required: false })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  pageSize?: number;

  @ApiProperty({ description: '商品ID', required: false })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  productId?: number;

  @ApiProperty({ description: '商品名称（模糊搜索）', required: false })
  @IsOptional()
  productName?: string;

  @ApiProperty({ description: '状态: 0-禁用, 1-启用', required: false })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  status?: number;
}

