import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class WxLoginDto {
  @ApiProperty({ description: '微信登录code', example: '081abc123def456' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: '用户信息（授权登录必需）', required: false })
  @IsOptional()
  userInfo?: {
    nickName?: string;
    avatarUrl?: string;
    gender?: number;
  };

  @ApiProperty({ description: '手机号（可选，用于绑定）', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone?: string;
}

export class BindPhoneDto {
  @ApiProperty({ description: '手机号', example: '13800138000' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string;
}

export class WxLoginResponseDto {
  @ApiProperty({ description: '用户ID' })
  userId: number;

  @ApiProperty({ description: 'token' })
  token: string;

  @ApiProperty({ description: '是否需要绑定手机号', example: false })
  needBindPhone: boolean;

  @ApiProperty({ description: '用户信息' })
  userInfo: {
    id: number;
    openid: string;
    nickname?: string;
    avatar?: string;
    gender: number;
    phone?: string;
  };
}
