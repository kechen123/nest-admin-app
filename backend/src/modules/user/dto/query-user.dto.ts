import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryUserDto extends PaginationDto {
  @ApiProperty({ description: '用户名（模糊搜索）', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ description: '邮箱（模糊搜索）', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: '角色', required: false })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ description: '部门ID', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  deptId?: number;
}
