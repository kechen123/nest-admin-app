import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsIn } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryMenuDto extends PaginationDto {
  @ApiProperty({ description: '菜单名称（模糊搜索）', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '状态: 0-禁用, 1-启用', required: false })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  status?: number;

  @ApiProperty({ description: '父菜单ID', required: false })
  @IsOptional()
  @IsInt()
  parentId?: number;
}

