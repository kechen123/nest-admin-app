import {
  Controller,
  Get,
  Post,
  Body,
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
import { OperationLogService } from './operation-log.service';
import { QueryOperationLogDto } from './dto/query-operation-log.dto';
import { PaginationResponseDto } from '../../common/dto/pagination.dto';
import { OperationLog } from './operation-log.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('操作日志')
@Controller('operation-logs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class OperationLogController {
  constructor(private readonly operationLogService: OperationLogService) {}

  @Get()
  @ApiOperation({ summary: '分页查询操作日志列表' })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  findAll(@Query() queryDto: QueryOperationLogDto) {
    return this.operationLogService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询操作日志' })
  @ApiResponse({ status: 200, type: OperationLog })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.operationLogService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建操作日志' })
  @ApiResponse({ status: 201, type: OperationLog })
  create(@Body() createDto: Partial<OperationLog>) {
    return this.operationLogService.create(createDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除操作日志' })
  @ApiResponse({ status: 200 })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.operationLogService.remove(id);
  }

  @Delete('batch/:ids')
  @ApiOperation({ summary: '批量删除操作日志' })
  @ApiResponse({ status: 200 })
  removeBatch(@Param('ids') ids: string) {
    const idArray = ids.split(',').map(id => parseInt(id, 10));
    return this.operationLogService.removeBatch(idArray);
  }
}

