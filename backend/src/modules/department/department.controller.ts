import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { QueryDepartmentDto } from './dto/query-department.dto';
import { PaginationResponseDto } from '../../common/dto/pagination.dto';
import { Department } from './department.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('部门管理')
@Controller('departments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @ApiOperation({ summary: '创建部门' })
  @ApiResponse({ status: 201, type: Department })
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentService.create(createDepartmentDto);
  }

  @Get('tree')
  @ApiOperation({ summary: '获取部门树' })
  @ApiResponse({ status: 200, type: [Department] })
  getDepartmentTree() {
    return this.departmentService.getDepartmentTree();
  }

  @Get('all')
  @ApiOperation({ summary: '获取所有部门列表（不分页，用于下拉选择）' })
  @ApiResponse({ status: 200, type: [Department] })
  findAllWithoutPagination() {
    return this.departmentService.findAllWithoutPagination();
  }

  @Get()
  @ApiOperation({ summary: '分页查询部门列表' })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  findAll(@Query() queryDto: QueryDepartmentDto) {
    return this.departmentService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询部门' })
  @ApiResponse({ status: 200, type: Department })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新部门' })
  @ApiResponse({ status: 200, type: Department })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除部门' })
  @ApiResponse({ status: 200 })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.remove(id);
  }
}

