import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';
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

  @ApiProperty({ description: '是否包含公开的打卡。1-包含（默认），0-不包含', example: 1, default: 1, required: false })
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1])
  @IsOptional()
  includePublic?: number = 1;
}
