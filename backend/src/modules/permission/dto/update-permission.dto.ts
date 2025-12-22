import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsEnum, IsInt, MinLength, MaxLength, Min } from "class-validator";

export class UpdatePermissionDto {
  @ApiProperty({ description: "权限名称", required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name?: string;

  @ApiProperty({ description: "权限代码", required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  code?: string;

  @ApiProperty({ description: "类型", enum: ["menu", "button", "api"], required: false })
  @IsOptional()
  @IsEnum(["menu", "button", "api"])
  type?: "menu" | "button" | "api";

  @ApiProperty({ description: "父级权限ID", required: false })
  @IsOptional()
  @IsInt()
  parentId?: number;

  @ApiProperty({ description: "路由路径", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  path?: string;

  @ApiProperty({ description: "图标", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiProperty({ description: "排序", required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort?: number;
}
