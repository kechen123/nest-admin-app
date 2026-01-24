import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { MiniappUser } from '../miniapp-user/miniapp-user.entity';

export enum InviteCodeStatus {
  PENDING = 'pending',     // 等待接受
  ACCEPTED = 'accepted',   // 已接受
  EXPIRED = 'expired',     // 已过期
  CANCELLED = 'cancelled'  // 已取消
}

@Entity('user_invite_code')
export class InviteCode extends BaseEntity {
  @ApiProperty({ description: '邀请码（唯一）' })
  @Column({ length: 32, unique: true })
  @Index()
  code: string;

  @ApiProperty({ description: '邀请者用户ID' })
  @Column({ name: 'inviter_id' })
  @Index()
  inviterId: number;

  @ApiProperty({
    description: '状态',
    enum: InviteCodeStatus,
    example: InviteCodeStatus.PENDING
  })
  @Column({
    type: 'enum',
    enum: InviteCodeStatus,
    default: InviteCodeStatus.PENDING
  })
  @Index()
  status: InviteCodeStatus;

  @ApiProperty({ description: '过期时间' })
  @Column({ name: 'expire_time', type: 'datetime' })
  @Index()
  expireTime: Date;

  @ApiProperty({ description: '接受时间', required: false })
  @Column({ name: 'accepted_at', type: 'datetime', nullable: true })
  acceptedAt?: Date;

  @ApiProperty({ description: '接受者用户ID', required: false })
  @Column({ name: 'accepted_by', nullable: true })
  @Index()
  acceptedBy?: number;

  @ApiProperty({ description: '是否已分享', example: false, default: false })
  @Column({ name: 'is_shared', type: 'tinyint', default: false })
  @Index()
  isShared: boolean;

  // 关联关系
  @ManyToOne(() => MiniappUser)
  @JoinColumn({ name: 'inviter_id' })
  inviter: MiniappUser;

  @ManyToOne(() => MiniappUser)
  @JoinColumn({ name: 'accepted_by' })
  accepter?: MiniappUser;
}