import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsInt } from "class-validator";

export class AssignPermissionsDto {
  @ApiProperty({ description: "权限ID数组", example: [1, 2, 3], type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  permissionIds: number[];
}
