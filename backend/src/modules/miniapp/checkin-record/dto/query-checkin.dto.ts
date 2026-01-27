import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

function toBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (v === 'true' || v === '1') return true;
    if (v === 'false' || v === '0') return false;
  }
  return Boolean(value);
}

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
  @Transform(({ value }) => toBoolean(value))
  @IsOptional()
  includePublic?: boolean = true;
}
