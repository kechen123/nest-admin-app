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
import { InviteConfigService } from './invite-config.service';
import { CreateInviteConfigDto } from './dto/create-invite-config.dto';
import { UpdateInviteConfigDto } from './dto/update-invite-config.dto';
import { QueryInviteConfigDto } from './dto/query-invite-config.dto';
import { ToggleEnabledDto } from './dto/toggle-enabled.dto';
import { InviteConfig } from './invite-config.entity';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { PaginationResponseDto } from '../../../common/dto/pagination.dto';

@ApiTags('邀请配置管理')
@Controller('invite-configs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class InviteConfigController {
  constructor(private readonly inviteConfigService: InviteConfigService) {}

  @Post()
  @ApiOperation({ summary: '创建邀请配置' })
  @ApiResponse({ status: 201, type: InviteConfig })
  create(@Body() createDto: CreateInviteConfigDto) {
    return this.inviteConfigService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: '分页查询邀请配置列表' })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  findAll(@Query() queryDto: QueryInviteConfigDto) {
    return this.inviteConfigService.findAll(queryDto);
  }

  @Get('enabled')
  @ApiOperation({ summary: '获取启用的邀请配置' })
  @ApiResponse({ status: 200, type: InviteConfig })
  findEnabled() {
    return this.inviteConfigService.findEnabled();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询邀请配置' })
  @ApiResponse({ status: 200, type: InviteConfig })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inviteConfigService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新邀请配置' })
  @ApiResponse({ status: 200, type: InviteConfig })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateInviteConfigDto,
  ) {
    return this.inviteConfigService.update(id, updateDto);
  }

  @Patch(':id/toggle-enabled')
  @ApiOperation({ summary: '启用/禁用邀请配置（启用时会自动禁用其他配置）' })
  @ApiResponse({ status: 200, type: InviteConfig })
  async toggleEnabled(
    @Param('id', ParseIntPipe) id: number,
    @Body() toggleDto: ToggleEnabledDto,
  ) {
    return this.inviteConfigService.toggleEnabled(id, toggleDto.isEnabled);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除邀请配置' })
  @ApiResponse({ status: 200 })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inviteConfigService.remove(id);
  }
}
