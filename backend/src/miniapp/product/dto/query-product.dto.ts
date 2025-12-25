import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryProductDto {
  @ApiProperty({ description: '分类ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @ApiProperty({ description: '关键词搜索', required: false })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ description: '是否推荐: 0-否, 1-是', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1])
  isRecommend?: number;

  @ApiProperty({ description: '是否新品: 0-否, 1-是', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1])
  isNew?: number;

  @ApiProperty({ description: '排序方式: sales-销量, price-价格, time-时间', required: false, default: 'time' })
  @IsOptional()
  @IsString()
  @IsIn(['sales', 'price', 'time'])
  sortBy?: string;

  @ApiProperty({ description: '排序方向: asc-升序, desc-降序', required: false, default: 'desc' })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: string;

  @ApiProperty({ description: '页码', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ description: '每页数量', example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}

