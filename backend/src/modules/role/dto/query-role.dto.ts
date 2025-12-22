import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";
import { PaginationDto } from "../../../common/dto/pagination.dto";

export class QueryRoleDto extends PaginationDto {
  @ApiProperty({ description: "角色名称（模糊搜索）", required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: "角色代码（模糊搜索）", required: false })
  @IsOptional()
  @IsString()
  code?: string;
}
