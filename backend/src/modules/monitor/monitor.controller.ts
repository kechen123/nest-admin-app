import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { MonitorService, ServerInfo } from './monitor.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('服务监控')
@Controller('monitor')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MonitorController {
  constructor(private readonly monitorService: MonitorService) {}

  @Get('server')
  @ApiOperation({ summary: '获取服务器信息' })
  @ApiResponse({ status: 200, description: '服务器信息' })
  getServerInfo(): Promise<ServerInfo> {
    return this.monitorService.getServerInfo();
  }
}

