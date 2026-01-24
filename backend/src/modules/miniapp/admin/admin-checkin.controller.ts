import {
  Controller,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AdminCheckinService } from './admin-checkin.service';
import { QueryCheckinDto } from './dto/query-checkin.dto';
import { AuditCheckinDto } from './dto/audit-checkin.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

@ApiTags('管理端-用户打卡管理')
@Controller('admin/miniapp/checkins')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AdminCheckinController {
  constructor(private readonly adminCheckinService: AdminCheckinService) {}

  @Get()
  @ApiOperation({ summary: '分页查询用户打卡列表' })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  findAll(@Query() queryDto: QueryCheckinDto) {
    return this.adminCheckinService.findAll(queryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除打卡记录' })
  @ApiParam({ name: 'id', description: '打卡记录ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminCheckinService.remove(id);
  }

  @Patch(':id/audit')
  @ApiOperation({ summary: '审核打卡记录' })
  @ApiParam({ name: 'id', description: '打卡记录ID' })
  @ApiResponse({ status: 200, description: '审核成功' })
  audit(
    @Param('id', ParseIntPipe) id: number,
    @Body() auditDto: AuditCheckinDto,
    @Req() req: any,
  ) {
    const auditBy = req.user?.userId || req.user?.id;
    return this.adminCheckinService.audit(id, auditDto, auditBy);
  }
}
