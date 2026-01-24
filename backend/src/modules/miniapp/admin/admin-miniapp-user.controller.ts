import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { AdminMiniappUserService } from './admin-miniapp-user.service';
import { QueryMiniappUserDto } from './dto/query-miniapp-user.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

@ApiTags('管理端-小程序用户管理')
@Controller('admin/miniapp/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AdminMiniappUserController {
  constructor(private readonly adminMiniappUserService: AdminMiniappUserService) {}

  @Get()
  @ApiOperation({ summary: '分页查询小程序用户列表' })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  findAll(@Query() queryDto: QueryMiniappUserDto) {
    return this.adminMiniappUserService.findAll(queryDto);
  }
}
