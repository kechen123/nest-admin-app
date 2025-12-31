import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, MinLength } from 'class-validator';

export class PhoneLoginDto {
  @ApiProperty({ description: '手机号', example: '13800138001' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string;

  @ApiProperty({ description: '密码', example: 'qwe123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: '密码长度不能少于6位' })
  password: string;
}

