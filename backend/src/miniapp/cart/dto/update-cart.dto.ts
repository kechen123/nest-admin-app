import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, IsOptional, IsIn } from 'class-validator';

export class UpdateCartDto {
  @ApiProperty({ description: '商品数量', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiProperty({ description: '是否选中: 0-否, 1-是', required: false })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  isSelected?: number;
}

