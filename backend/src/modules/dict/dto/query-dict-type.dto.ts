import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsIn } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryDictTypeDto extends PaginationDto {
  @ApiProperty({ description: '字典名称（模糊搜索）', required: false })
  @IsOptional()
  @IsString()
  dictName?: string;

  @ApiProperty({ description: '字典类型（模糊搜索）', required: false })
  @IsOptional()
  @IsString()
  dictType?: string;

  @ApiProperty({ description: '状态: 0-停用, 1-正常', required: false })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  status?: number;
}

