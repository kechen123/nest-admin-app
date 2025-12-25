import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';

export class UpdateUserStatusDto {
  @ApiProperty({ description: '状态: 0-禁用, 1-正常' })
  @IsInt()
  @Min(0)
  @Max(1)
  status: number;
}

