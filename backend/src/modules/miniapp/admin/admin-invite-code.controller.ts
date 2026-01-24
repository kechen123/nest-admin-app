import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AdminInviteCodeService } from './admin-invite-code.service';
import { QueryInviteCodeDto } from './dto/query-invite-code.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

@ApiTags('管理端-邀请码管理')
@Controller('admin/miniapp/invite-codes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AdminInviteCodeController {
  constructor(private readonly adminInviteCodeService: AdminInviteCodeService) {}

  @Get()
  @ApiOperation({ summary: '分页查询邀请码列表' })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  findAll(@Query() queryDto: QueryInviteCodeDto) {
    return this.adminInviteCodeService.findAll(queryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除邀请码' })
  @ApiParam({ name: 'id', description: '邀请码ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminInviteCodeService.remove(id);
  }
}
