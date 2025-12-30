import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class QueryBannerDto extends PaginationDto {
  @ApiProperty({ description: '标题（模糊查询）', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: '状态: 0-禁用, 1-启用', required: false })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1)
  @IsOptional()
  status?: number;

  @ApiProperty({ description: '跳转类型: 0-无, 1-商品, 2-分类, 3-链接', required: false })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(3)
  @IsOptional()
  linkType?: number;
}

