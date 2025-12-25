import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AdjustPointsDto {
  @ApiProperty({ description: '调整积分（正数为增加，负数为减少）', example: 100 })
  @IsInt()
  @Min(-999999)
  points: number;

  @ApiProperty({ description: '备注', required: false })
  remark?: string;
}

