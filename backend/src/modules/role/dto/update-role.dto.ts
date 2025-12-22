import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsArray, IsInt, MinLength, MaxLength } from "class-validator";

export class UpdateRoleDto {
  @ApiProperty({ description: "角色名称", required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name?: string;

  @ApiProperty({ description: "角色代码", required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code?: string;

  @ApiProperty({ description: "备注", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;

  @ApiProperty({ description: "权限ID数组", required: false, type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  permissions?: number[];
}
