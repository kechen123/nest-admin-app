import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { MiniappUser } from '../miniapp-user/miniapp-user.entity';

@Entity('user_couple')
export class UserCouple extends BaseEntity {
  @ApiProperty({ description: '用户ID' })
  @Column({ name: 'user_id' })
  userId: number;

  @ApiProperty({ description: '另一半用户ID' })
  @Column({ name: 'partner_id' })
  partnerId: number;

  @ApiProperty({ description: '状态: 0-已解除, 1-绑定中', example: 1, default: 1 })
  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @ApiProperty({ description: '绑定时间', required: false })
  @Column({ name: 'bind_time', type: 'datetime', nullable: true })
  bindTime?: Date;

  @ApiProperty({ description: '解除绑定时间', required: false })
  @Column({ name: 'unbind_time', type: 'datetime', nullable: true })
  unbindTime?: Date;

  // 关联关系
  @ManyToOne(() => MiniappUser, (user) => user.couples)
  @JoinColumn({ name: 'user_id' })
  user: MiniappUser;

  @ManyToOne(() => MiniappUser, (user) => user.partnerCouples)
  @JoinColumn({ name: 'partner_id' })
  partner: MiniappUser;
}
