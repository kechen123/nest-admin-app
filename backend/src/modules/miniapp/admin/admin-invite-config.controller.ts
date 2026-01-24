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
import { AdminInviteConfigService } from './admin-invite-config.service';
import { CreateInviteConfigDto } from '../invite-config/dto/create-invite-config.dto';
import { UpdateInviteConfigDto } from '../invite-config/dto/update-invite-config.dto';
import { QueryInviteConfigDto } from '../invite-config/dto/query-invite-config.dto';
import { ToggleEnabledDto } from '../invite-config/dto/toggle-enabled.dto';
import { InviteConfig } from '../invite-config/invite-config.entity';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { PaginationResponseDto } from '../../../common/dto/pagination.dto';

@ApiTags('管理端-邀请信息管理')
@Controller('admin/miniapp/invite-configs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AdminInviteConfigController {
  constructor(private readonly adminInviteConfigService: AdminInviteConfigService) {}

  @Post()
  @ApiOperation({ summary: '新增邀请信息' })
  @ApiResponse({ status: 201, type: InviteConfig })
  create(@Body() createDto: CreateInviteConfigDto) {
    return this.adminInviteConfigService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: '分页查询邀请信息列表' })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  findAll(@Query() queryDto: QueryInviteConfigDto) {
    return this.adminInviteConfigService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询邀请信息' })
  @ApiResponse({ status: 200, type: InviteConfig })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminInviteConfigService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '修改邀请信息' })
  @ApiResponse({ status: 200, type: InviteConfig })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateInviteConfigDto,
  ) {
    return this.adminInviteConfigService.update(id, updateDto);
  }

  @Patch(':id/toggle-enabled')
  @ApiOperation({ summary: '启用/禁用邀请信息' })
  @ApiResponse({ status: 200, type: InviteConfig })
  toggleEnabled(
    @Param('id', ParseIntPipe) id: number,
    @Body() toggleDto: ToggleEnabledDto,
  ) {
    return this.adminInviteConfigService.toggleEnabled(id, toggleDto.isEnabled);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除邀请信息' })
  @ApiResponse({ status: 200 })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminInviteConfigService.remove(id);
  }
}
