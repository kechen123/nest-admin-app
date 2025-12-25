import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Body,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { MiniappUserService } from './miniapp-user.service';
import { QueryMiniappUserDto } from './dto/query-miniapp-user.dto';
import { UpdateMiniappUserDto } from './dto/update-miniapp-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';
import { AdjustPointsDto } from './dto/adjust-points.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination.dto';
import { MiniappUser } from '../../../common/entities/mall/miniapp-user.entity';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('小程序用户管理')
@Controller('mall/miniapp-users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MiniappUserController {
  constructor(private readonly miniappUserService: MiniappUserService) {}

  @Get()
  @ApiOperation({ summary: '分页查询小程序用户列表' })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  findAll(@Query() queryDto: QueryMiniappUserDto) {
    return this.miniappUserService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询小程序用户' })
  @ApiResponse({ status: 200, type: MiniappUser })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.miniappUserService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新小程序用户信息' })
  @ApiResponse({ status: 200, type: MiniappUser })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateMiniappUserDto,
    @Req() req: Request,
  ) {
    return this.miniappUserService.update(id, updateUserDto, req);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '更新用户状态（启用/禁用）' })
  @ApiResponse({ status: 200, type: MiniappUser })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateUserStatusDto,
    @Req() req: Request,
  ) {
    return this.miniappUserService.updateStatus(id, updateStatusDto.status, req);
  }

  @Patch(':id/balance')
  @ApiOperation({ summary: '调整用户余额' })
  @ApiResponse({ status: 200, type: MiniappUser })
  adjustBalance(
    @Param('id', ParseIntPipe) id: number,
    @Body() adjustBalanceDto: AdjustBalanceDto,
    @Req() req: Request,
  ) {
    return this.miniappUserService.adjustBalance(id, adjustBalanceDto, req);
  }

  @Patch(':id/points')
  @ApiOperation({ summary: '调整用户积分' })
  @ApiResponse({ status: 200, type: MiniappUser })
  adjustPoints(
    @Param('id', ParseIntPipe) id: number,
    @Body() adjustPointsDto: AdjustPointsDto,
    @Req() req: Request,
  ) {
    return this.miniappUserService.adjustPoints(id, adjustPointsDto, req);
  }
}

