import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class BindPartnerDto {
  @ApiProperty({ description: '另一半的用户ID', example: 2 })
  @IsInt()
  @IsNotEmpty()
  partnerId: number;
}

export class UnbindPartnerDto {
  @ApiProperty({ description: '绑定关系ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  coupleId: number;
}
