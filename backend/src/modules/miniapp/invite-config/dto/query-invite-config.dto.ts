import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryInviteConfigDto {
  @ApiProperty({ description: '页码', example: 1, required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: '每页数量', example: 10, required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;

  @ApiProperty({ description: '是否启用: 0-未启用, 1-启用', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1])
  isEnabled?: number;
}
