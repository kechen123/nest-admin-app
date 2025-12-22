import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, MaxLength, MinLength, ValidateIf } from 'class-validator';
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
  avatar?: string;

  @ApiProperty({ description: '角色', required: false })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ description: '状态', required: false })
  @IsOptional()
  status?: boolean;
}
