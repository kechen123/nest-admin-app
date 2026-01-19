import { ApiProperty } from '@nestjs/swagger';

export class UserInfoDto {
  @ApiProperty({ description: '用户ID' })
  id: number;

  @ApiProperty({ description: '昵称', required: false })
  nickname?: string;

  @ApiProperty({ description: '头像URL', required: false })
  avatar?: string;

  @ApiProperty({ description: '性别: 0-未知, 1-男, 2-女', example: 0 })
  gender: number;

  @ApiProperty({ description: '手机号', required: false })
  phone?: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}

export class UserInfoResponseDto {
  @ApiProperty({ description: '当前用户信息' })
  userInfo: UserInfoDto;

  @ApiProperty({ description: '是否绑定了另一半', example: false })
  hasPartner: boolean;

  @ApiProperty({ description: '另一半用户信息', required: false })
  partnerInfo?: UserInfoDto;
}