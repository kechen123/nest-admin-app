import { ApiProperty } from '@nestjs/swagger';
import { InviteCodeStatus } from '../invite-code.entity';

export class UserInviteListDto {
  @ApiProperty({ description: '邀请码ID' })
  id: number;

  @ApiProperty({ description: '邀请码' })
  code: string;

  @ApiProperty({
    description: '状态',
    enum: InviteCodeStatus
  })
  status: InviteCodeStatus;

  @ApiProperty({ description: '过期时间' })
  expireTime: Date;

  @ApiProperty({ description: '接受时间', required: false })
  acceptedAt?: Date;

  @ApiProperty({ description: '接受者信息', required: false })
  accepter?: {
    id: number;
    nickname: string;
    avatar?: string;
  };

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '是否已过期' })
  isExpired: boolean;
}