import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../../common/dto/pagination.dto';
import { InviteCodeStatus } from '../../invite-code/invite-code.entity';

export class QueryInviteCodeDto extends PaginationDto {
  @ApiProperty({ description: '邀请码（模糊查询）', required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ description: '状态', enum: InviteCodeStatus, required: false })
  @IsOptional()
  @IsEnum(InviteCodeStatus)
  status?: InviteCodeStatus;

  @ApiProperty({ description: '邀请者昵称（模糊查询）', required: false })
  @IsOptional()
  @IsString()
  inviterNickname?: string;
}
