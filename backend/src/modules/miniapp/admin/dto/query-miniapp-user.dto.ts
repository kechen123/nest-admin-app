import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class QueryMiniappUserDto extends PaginationDto {
  @ApiProperty({ description: '昵称（模糊查询）', required: false })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiProperty({ description: '手机号（模糊查询）', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: '状态: 0-禁用, 1-正常', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;
}
