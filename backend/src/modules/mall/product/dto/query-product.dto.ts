import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class QueryProductDto extends PaginationDto {
  @ApiProperty({ description: '商品名称（模糊查询）', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: '分类ID', required: false })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @ApiProperty({ description: '状态: 0-下架, 1-上架', required: false })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1)
  @IsOptional()
  status?: number;

  @ApiProperty({ description: '是否推荐: 0-否, 1-是', required: false })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1)
  @IsOptional()
  isRecommend?: number;

  @ApiProperty({ description: '是否新品: 0-否, 1-是', required: false })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1)
  @IsOptional()
  isNew?: number;
}

