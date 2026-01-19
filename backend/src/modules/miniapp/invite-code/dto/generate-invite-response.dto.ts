import { ApiProperty } from '@nestjs/swagger';

export class GenerateInviteResponseDto {
  @ApiProperty({ description: '邀请码ID' })
  id: number;

  @ApiProperty({ description: '邀请码' })
  code: string;

  @ApiProperty({ description: '过期时间' })
  expireTime: Date;

  @ApiProperty({ description: '邀请链接' })
  inviteUrl: string;

  @ApiProperty({ description: '小程序分享参数' })
  shareParams: {
    title: string;
    path: string;
    imageUrl?: string;
  };
}