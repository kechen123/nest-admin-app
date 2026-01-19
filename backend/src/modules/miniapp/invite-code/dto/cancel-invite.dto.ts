import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CancelInviteDto {
  @ApiProperty({
    description: '邀请码ID',
    example: 1
  })
  @IsNotEmpty()
  @IsString()
  inviteCodeId: number;
}