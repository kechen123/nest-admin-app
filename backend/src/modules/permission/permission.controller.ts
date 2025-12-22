import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from "@nestjs/swagger";
import { PermissionService } from "./permission.service";
import { CreatePermissionDto } from "./dto/create-permission.dto";
import { UpdatePermissionDto } from "./dto/update-permission.dto";
import { QueryPermissionDto } from "./dto/query-permission.dto";
import { PaginationResponseDto } from "../../common/dto/pagination.dto";
import { Permission } from "./permission.entity";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";

@ApiTags("权限管理")
@Controller("permissions")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("JWT-auth")
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @ApiOperation({ summary: "创建权限" })
  @ApiResponse({ status: 201, type: Permission })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Get("tree")
  @ApiOperation({ summary: "获取权限树" })
  @ApiResponse({ status: 200, type: [Permission] })
  findTree() {
    return this.permissionService.findTree();
  }

  @Get()
  @ApiOperation({ summary: "分页查询权限列表" })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  findAll(@Query() queryDto: QueryPermissionDto) {
    return this.permissionService.findAll(queryDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "根据ID查询权限" })
  @ApiResponse({ status: 200, type: Permission })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.permissionService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "更新权限" })
  @ApiResponse({ status: 200, type: Permission })
  update(@Param("id", ParseIntPipe) id: number, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "删除权限" })
  @ApiResponse({ status: 200 })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.permissionService.remove(id);
  }
}
