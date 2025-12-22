import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { DepartmentService } from './department.service';
import { Department } from './department.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('部门管理')
@Controller('department')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  @ApiOperation({ summary: '获取所有部门列表' })
  @ApiResponse({ status: 200, type: [Department] })
  async findAll() {
    return await this.departmentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询部门' })
  @ApiParam({ name: 'id', description: '部门ID', example: 1 })
  @ApiResponse({ status: 200, type: Department })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.departmentService.findOne(id);
  }
}

