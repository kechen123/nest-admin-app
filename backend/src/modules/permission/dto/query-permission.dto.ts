import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsEnum, IsInt } from "class-validator";
import { PaginationDto } from "../../../common/dto/pagination.dto";

export class QueryPermissionDto extends PaginationDto {
  @ApiProperty({ description: "权限名称（模糊搜索）", required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: "权限代码（模糊搜索）", required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ description: "类型", enum: ["menu", "button", "api"], required: false })
  @IsOptional()
  @IsEnum(["menu", "button", "api"])
  type?: "menu" | "button" | "api";

  @ApiProperty({ description: "父级权限ID", required: false })
  @IsOptional()
  @IsInt()
  parentId?: number;
}
