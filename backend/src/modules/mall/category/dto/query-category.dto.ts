import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class QueryCategoryDto extends PaginationDto {
  @ApiProperty({ description: '分类名称（模糊查询）', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: '父分类ID', required: false })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  parentId?: number;

  @ApiProperty({ description: '状态: 0-禁用, 1-启用', required: false })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1)
  @IsOptional()
  status?: number;
}

