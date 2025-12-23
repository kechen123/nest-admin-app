import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  IsInt,
  IsIn,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: 'admin' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({ description: '邮箱', example: 'admin@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @ApiProperty({ description: '昵称', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nickname?: string;

  @ApiProperty({ description: '头像URL', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar?: string;

  @ApiProperty({ description: '手机号', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ description: '性别: 0-未知, 1-男, 2-女', example: 0, required: false })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1, 2])
  gender?: number;

  @ApiProperty({ description: '部门ID', required: false })
  @IsOptional()
  @IsInt()
  deptId?: number;

  @ApiProperty({ description: '岗位ID', required: false })
  @IsOptional()
  @IsInt()
  postId?: number;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;

  @ApiProperty({ description: '状态: 0-禁用, 1-正常', example: 1, required: false })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  status?: number;

  @ApiProperty({ description: '是否管理员: 0-否, 1-是', example: 0, required: false })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  isAdmin?: number;

  @ApiProperty({ description: '角色代码（单个）', example: 'user', required: false })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ description: '角色ID数组（多个角色）', required: false, type: [Number] })
  @IsOptional()
  @IsInt({ each: true })
  roleIds?: number[];
}
