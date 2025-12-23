import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, MaxLength, MinLength, ValidateIf, IsInt, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @ApiProperty({ description: '邮箱', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: '密码', required: false })
  @IsOptional()
  @Transform(({ value }) => {
    // 如果值为空字符串、null 或 undefined，返回 undefined（这样字段会被移除）
    if (value === null || value === undefined || value === '' || (typeof value === 'string' && value.trim().length === 0)) {
      return undefined;
    }
    return value;
  })
  @ValidateIf((o) => {
    const pwd = o.password;
    return pwd !== undefined && pwd !== null && pwd !== '' && String(pwd).trim().length > 0;
  })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度不能少于6位' })
  password?: string;

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

  @ApiProperty({ description: '性别: 0-未知, 1-男, 2-女', required: false })
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

  @ApiProperty({ description: '状态: 0-禁用, 1-正常', required: false })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  status?: number;

  @ApiProperty({ description: '是否管理员: 0-否, 1-是', required: false })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  isAdmin?: number;

  @ApiProperty({ description: '角色代码（单个）', required: false })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ description: '角色ID数组（多个角色）', required: false, type: [Number] })
  @IsOptional()
  @IsInt({ each: true })
  roleIds?: number[];
}
