import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { MiniappUser } from '../miniapp-user/miniapp-user.entity';
import { CheckinRecord } from '../checkin-record/checkin-record.entity';

@Entity('checkin_notification')
export class CheckinNotification extends BaseEntity {
  @ApiProperty({ description: '接收通知的用户ID' })
  @Column({ name: 'user_id' })
  userId: number;

  @ApiProperty({ description: '打卡记录ID' })
  @Column({ name: 'checkin_id' })
  checkinId: number;

  @ApiProperty({ description: '通知类型: 1-另一半打卡通知', example: 1, default: 1 })
  @Column({ type: 'tinyint', default: 1 })
  type: number;

  @ApiProperty({ description: '是否已读: 0-未读, 1-已读', example: 0, default: 0 })
  @Column({ name: 'is_read', type: 'tinyint', default: 0 })
  isRead: number;

  // 关联关系
  @ManyToOne(() => MiniappUser)
  @JoinColumn({ name: 'user_id' })
  user: MiniappUser;

  @ManyToOne(() => CheckinRecord)
  @JoinColumn({ name: 'checkin_id' })
  checkin: CheckinRecord;
}
