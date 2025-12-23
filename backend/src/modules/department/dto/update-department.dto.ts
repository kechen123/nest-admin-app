import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsEmail, MaxLength, MinLength, IsIn } from 'class-validator';

export class UpdateDepartmentDto {
  @ApiProperty({ description: '部门名称', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiProperty({ description: '父部门ID', required: false })
  @IsOptional()
  @IsInt()
  parentId?: number;

  @ApiProperty({ description: '祖级列表', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  ancestors?: string;

  @ApiProperty({ description: '负责人', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  leader?: string;

  @ApiProperty({ description: '联系电话', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ description: '邮箱', required: false })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @ApiProperty({ description: '显示顺序', required: false })
  @IsOptional()
  @IsInt()
  orderNum?: number;

  @ApiProperty({ description: '状态: 0-停用, 1-正常', required: false })
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

