import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class WxLoginDto {
  @ApiProperty({ description: '微信登录code', example: '081abc123def456' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: '用户信息（可选）', required: false })
  @IsOptional()
  userInfo?: {
    nickName?: string;
    avatarUrl?: string;
    gender?: number;
  };
}

export class WxLoginResponseDto {
  @ApiProperty({ description: '用户ID' })
  userId: number;

  @ApiProperty({ description: 'token' })
  token: string;

  @ApiProperty({ description: '用户信息' })
  userInfo: {
    id: number;
    openid: string;
    nickname?: string;
    avatar?: string;
    gender: number;
  };
}
