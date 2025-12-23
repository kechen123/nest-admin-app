import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, Length } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ description: '昵称', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  nickname?: string;

  @ApiProperty({ description: '邮箱', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: '手机号', required: false })
  @IsOptional()
  @IsString()
  @Length(11, 11)
  phone?: string;

  @ApiProperty({ description: '头像URL', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: '性别: 0-未知, 1-男, 2-女', required: false })
  @IsOptional()
  gender?: number;
}

