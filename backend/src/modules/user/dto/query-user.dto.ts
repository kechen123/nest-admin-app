import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
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
}
