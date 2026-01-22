import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryCheckinDto {
  @ApiProperty({ description: '页码', example: 1, default: 1, required: false })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ description: '每页数量', example: 10, default: 10, required: false })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  pageSize?: number = 10;

  @ApiProperty({ description: '用户ID', required: false })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  userId?: number;

  @ApiProperty({ description: '开始日期（YYYY-MM-DD）', required: false })
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: '结束日期（YYYY-MM-DD）', required: false })
  @IsOptional()
  endDate?: string;

  @ApiProperty({ description: '是否包含公开的打卡', example: true, default: true, required: false })
  @Type(() => Boolean)
  @IsOptional()
  includePublic?: boolean = true;
}
