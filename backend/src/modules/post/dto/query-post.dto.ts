import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsIn } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryPostDto extends PaginationDto {
  @ApiProperty({ description: '岗位名称或编码（模糊搜索）', required: false })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ description: '状态: 0-停用, 1-正常', required: false })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  status?: number;
}

