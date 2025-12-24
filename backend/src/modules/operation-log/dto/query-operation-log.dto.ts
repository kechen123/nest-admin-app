import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryOperationLogDto extends PaginationDto {
  @ApiProperty({ description: '操作模块（模糊搜索）', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: '业务类型（模糊搜索）', required: false })
  @IsOptional()
  @IsString()
  businessType?: string;

  @ApiProperty({ description: '操作人员账号（模糊搜索）', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ description: '操作状态: 0-异常, 1-正常', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;

  @ApiProperty({ description: '操作人员ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;

  @ApiProperty({ description: '开始时间', required: false })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiProperty({ description: '结束时间', required: false })
  @IsOptional()
  @IsDateString()
  endTime?: string;
}

