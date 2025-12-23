import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: '旧密码', example: 'oldPassword123' })
  @IsString()
  @MinLength(6)
  oldPassword: string;

  @ApiProperty({ description: '新密码', example: 'newPassword123' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

