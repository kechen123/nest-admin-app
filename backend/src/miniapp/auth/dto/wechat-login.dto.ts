import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class WechatLoginDto {
  @ApiProperty({ description: '微信登录code', example: '081abc123def456' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: '用户信息（加密数据）', required: false })
  @IsString()
  encryptedData?: string;

  @ApiProperty({ description: '初始向量', required: false })
  @IsString()
  iv?: string;
}

