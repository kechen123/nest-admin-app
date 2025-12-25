import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class QueryMiniappUserDto extends PaginationDto {
  @ApiProperty({ description: '昵称（模糊查询）', required: false })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiProperty({ description: '手机号（模糊查询）', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: '状态: 0-禁用, 1-正常', required: false })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1)
  @IsOptional()
  status?: number;

  @ApiProperty({ description: '会员等级: 0-普通, 1-银卡, 2-金卡, 3-钻石', required: false })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(3)
  @IsOptional()
  memberLevel?: number;
}

