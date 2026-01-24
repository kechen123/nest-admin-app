import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsInt, Min, IsIn } from 'class-validator';

export class CreateInviteConfigDto {
  @ApiProperty({ description: '邀请标题', example: '邀请你共同记录美好时光' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: '邀请图片URL', example: '/static/images/invite-share.png' })
  @IsString()
  @MaxLength(500)
  imageUrl: string;

  @ApiProperty({ description: '排序', example: 0, required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}
