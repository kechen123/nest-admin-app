import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsIn } from 'class-validator';

export class ToggleEnabledDto {
  @ApiProperty({ description: '是否启用: 0-未启用, 1-启用', example: 1 })
  @IsInt()
  @IsIn([0, 1])
  isEnabled: number;
}
