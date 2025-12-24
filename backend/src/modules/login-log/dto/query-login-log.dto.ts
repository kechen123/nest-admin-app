import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryLoginLogDto extends PaginationDto {
  @ApiProperty({ description: '登录账号（模糊搜索）', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ description: '登录IP地址（模糊搜索）', required: false })
  @IsOptional()
  @IsString()
  ipaddr?: string;

  @ApiProperty({ description: '登录状态: 0-失败, 1-成功', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;

  @ApiProperty({ description: '开始时间', required: false })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiProperty({ description: '结束时间', required: false })
  @IsOptional()
  @IsDateString()
  endTime?: string;
}

