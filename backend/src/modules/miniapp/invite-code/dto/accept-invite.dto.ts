import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AcceptInviteDto {
  @ApiProperty({
    description: '邀请码',
    example: 'ABC123XYZ456'
  })
  @IsNotEmpty()
  @IsString()
  code: string;
}