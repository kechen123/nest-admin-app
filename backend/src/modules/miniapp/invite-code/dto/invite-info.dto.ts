import { ApiProperty } from '@nestjs/swagger';
import { InviteCodeStatus } from '../invite-code.entity';

export class InviteInfoDto {
  @ApiProperty({ description: '邀请码ID' })
  id: number;

  @ApiProperty({ description: '邀请码' })
  code: string;

  @ApiProperty({ description: '邀请者信息' })
  inviter: {
    id: number;
    nickname: string;
    avatar?: string;
  };

  @ApiProperty({
    description: '状态',
    enum: InviteCodeStatus
  })
  status: InviteCodeStatus;

  @ApiProperty({ description: '过期时间' })
  expireTime: Date;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '是否已过期' })
  isExpired: boolean;

  @ApiProperty({ description: '是否可接受' })
  canAccept: boolean;
}