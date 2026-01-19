import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';

export class GenerateInviteDto {
  @ApiProperty({
    description: '邀请码有效期（小时），默认为24小时',
    example: 24,
    required: false,
    default: 24
  })
  @IsOptional()
  @IsNumber()
  expireHours?: number = 24;
}