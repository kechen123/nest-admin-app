import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MarkSharedDto {
  @ApiProperty({
    description: '邀请码',
    example: 'ABC123'
  })
  @IsNotEmpty()
  @IsString()
  code: string;
}
