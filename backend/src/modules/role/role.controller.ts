import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from "@nestjs/swagger";
import { RoleService } from "./role.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { QueryRoleDto } from "./dto/query-role.dto";
import { AssignPermissionsDto } from "./dto/assign-permissions.dto";
import { PaginationResponseDto } from "../../common/dto/pagination.dto";
import { Role } from "./role.entity";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";

@ApiTags("角色管理")
@Controller("roles")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("JWT-auth")
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiOperation({ summary: "创建角色" })
  @ApiResponse({ status: 201, type: Role })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get("all")
  @ApiOperation({ summary: "获取所有角色列表（不分页）" })
  @ApiResponse({ status: 200, type: [Role] })
  findAllWithoutPagination() {
    return this.roleService.findAllWithoutPagination();
  }

  @Get()
  @ApiOperation({ summary: "分页查询角色列表" })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  findAll(@Query() queryDto: QueryRoleDto) {
    return this.roleService.findAll(queryDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "根据ID查询角色" })
  @ApiResponse({ status: 200, type: Role })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.roleService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "更新角色" })
  @ApiResponse({ status: 200, type: Role })
  update(@Param("id", ParseIntPipe) id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Post(":id/permissions")
  @ApiOperation({ summary: "分配权限" })
  @ApiResponse({ status: 200, type: Role })
  assignPermissions(@Param("id", ParseIntPipe) id: number, @Body() assignPermissionsDto: AssignPermissionsDto) {
    return this.roleService.assignPermissions(id, assignPermissionsDto.permissionIds);
  }

  @Delete(":id")
  @ApiOperation({ summary: "删除角色" })
  @ApiResponse({ status: 200 })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.roleService.remove(id);
  }
}
