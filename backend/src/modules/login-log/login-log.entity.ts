import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('login_logs')
export class LoginLog {
  @ApiProperty({ description: 'ID' })
  @Column({ primary: true, generated: true })
  id: number;

  @ApiProperty({ description: '登录账号', required: false })
  @Index()
  @Column({ length: 50, nullable: true })
  username?: string;

  @ApiProperty({ description: '登录IP地址', required: false })
  @Column({ length: 50, nullable: true })
  ipaddr?: string;

  @ApiProperty({ description: '登录地点', required: false })
  @Column({ name: 'login_location', length: 255, nullable: true })
  loginLocation?: string;

  @ApiProperty({ description: '浏览器类型', required: false })
  @Column({ length: 50, nullable: true })
  browser?: string;

  @ApiProperty({ description: '操作系统', required: false })
  @Column({ length: 50, nullable: true })
  os?: string;

  @ApiProperty({ description: '登录状态: 0-失败, 1-成功', default: 1 })
  @Index()
  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @ApiProperty({ description: '提示消息', required: false })
  @Column({ length: 255, nullable: true })
  msg?: string;

  @ApiProperty({ description: '登录时间' })
  @Index()
  @Column({ name: 'login_time', type: 'datetime', nullable: true })
  loginTime?: Date;
}

