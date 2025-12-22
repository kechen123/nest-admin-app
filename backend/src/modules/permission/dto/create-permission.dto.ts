import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsEnum, IsInt, MinLength, MaxLength, Min } from "class-validator";

export class CreatePermissionDto {
  @ApiProperty({ description: "权限名称", example: "创建用户" })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: "权限代码", example: "user:create" })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  code: string;

  @ApiProperty({ description: "类型", example: "button", enum: ["menu", "button", "api"] })
  @IsEnum(["menu", "button", "api"])
  type: "menu" | "button" | "api";

  @ApiProperty({ description: "父级权限ID", example: 1, required: false })
  @IsOptional()
  @IsInt()
  parentId?: number;

  @ApiProperty({ description: "路由路径", example: "/user", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  path?: string;

  @ApiProperty({ description: "图标", example: "User", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiProperty({ description: "排序", example: 0, default: 0, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort?: number;
}
