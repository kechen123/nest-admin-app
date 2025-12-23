import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsIn } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryDictDataDto extends PaginationDto {
  @ApiProperty({ description: '字典类型', required: false })
  @IsOptional()
  @IsString()
  dictType?: string;

  @ApiProperty({ description: '字典标签（模糊搜索）', required: false })
  @IsOptional()
  @IsString()
  dictLabel?: string;

  @ApiProperty({ description: '状态: 0-停用, 1-正常', required: false })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  status?: number;
}

