import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, Length, Matches } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ description: '昵称', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50, { message: '昵称长度应在1-50个字符之间' })
  nickname?: string;

  @ApiProperty({ description: '头像URL', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 500, { message: '头像URL长度应在1-500个字符之间' })
  avatar?: string;

  @ApiProperty({ description: '性别: 0-未知, 1-男, 2-女', required: false })
  @IsOptional()
  @IsIn([0, 1, 2], { message: '性别值只能是0、1或2' })
  gender?: number;

  @ApiProperty({ description: '手机号', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone?: string;
}