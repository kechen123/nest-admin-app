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
import { LoginLogService } from './login-log.service';
import { QueryLoginLogDto } from './dto/query-login-log.dto';
import { PaginationResponseDto } from '../../common/dto/pagination.dto';
import { LoginLog } from './login-log.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('登录日志')
@Controller('login-logs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class LoginLogController {
  constructor(private readonly loginLogService: LoginLogService) {}

  @Get()
  @ApiOperation({ summary: '分页查询登录日志列表' })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  findAll(@Query() queryDto: QueryLoginLogDto) {
    return this.loginLogService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询登录日志' })
  @ApiResponse({ status: 200, type: LoginLog })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.loginLogService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建登录日志' })
  @ApiResponse({ status: 201, type: LoginLog })
  create(@Body() createDto: Partial<LoginLog>) {
    return this.loginLogService.create(createDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除登录日志' })
  @ApiResponse({ status: 200 })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.loginLogService.remove(id);
  }

  @Delete('batch/:ids')
  @ApiOperation({ summary: '批量删除登录日志' })
  @ApiResponse({ status: 200 })
  removeBatch(@Param('ids') ids: string) {
    const idArray = ids.split(',').map(id => parseInt(id, 10));
    return this.loginLogService.removeBatch(idArray);
  }
}

