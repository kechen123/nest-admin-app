import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsArray, IsInt, MinLength, MaxLength, ArrayMinSize } from "class-validator";

export class CreateRoleDto {
  @ApiProperty({ description: "角色名称", example: "管理员" })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: "角色代码", example: "admin" })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: "描述", example: "拥有所有权限", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiProperty({ description: "权限ID数组", example: [1, 2, 3], required: false, type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  permissions?: number[];
}
