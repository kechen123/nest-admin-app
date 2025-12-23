import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, MaxLength, MinLength, IsIn } from 'class-validator';

export class CreateDictTypeDto {
  @ApiProperty({ description: '字典名称', example: '用户性别' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  dictName: string;

  @ApiProperty({ description: '字典类型', example: 'sys_user_sex' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  dictType: string;

  @ApiProperty({ description: '状态: 0-停用, 1-正常', example: 1, default: 1, required: false })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  status?: number;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}

