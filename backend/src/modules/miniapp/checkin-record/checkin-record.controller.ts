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
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { CheckinRecordService } from './checkin-record.service';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { UpdateCheckinDto } from './dto/update-checkin.dto';
import { QueryCheckinDto } from './dto/query-checkin.dto';
import { QueryMapMarkersDto } from './dto/query-map-markers.dto';
import { CheckinRecord } from './checkin-record.entity';
import { PaginationResponseDto } from '../../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../../auth/guards/optional-jwt-auth.guard';

@ApiTags('打卡记录')
@Controller('miniapp/checkin')
export class CheckinRecordController {
  constructor(private readonly recordService: CheckinRecordService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '创建打卡记录' })
  @ApiResponse({ status: 201, type: CheckinRecord })
  async create(@Req() req: any, @Body() createDto: CreateCheckinDto) {
    const userId = req.user?.userId || req.user?.id;
    return await this.recordService.create(userId, createDto);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: '分页查询打卡记录' })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  async findAll(@Req() req: any, @Query() queryDto: QueryCheckinDto) {
    // 不强制要求登录，如果有登录信息则使用
    const userId = req.user?.userId || req.user?.id;
    return await this.recordService.findAll(queryDto, userId);
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取打卡统计' })
  @ApiResponse({ status: 200 })
  async getStatistics(@Req() req: any) {
    const userId = req.user?.userId || req.user?.id;
    return await this.recordService.getStatistics(userId);
  }

  @Get('map/markers')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ 
    summary: '获取地图标记点（支持位置范围查询）',
    description: `
获取地图标记点数据，支持以下功能：
1. **位置范围查询**：通过 latitude、longitude、radius 参数查询指定范围内的点位
2. **数据权限**：
   - 未登录用户：只返回公开的打卡记录
   - 已登录用户：返回公开的打卡记录 + 用户自己的私密记录 + 绑定用户的私密记录
3. **includePublic 参数**：
   - 1（默认）：包含公开数据，如果用户登录也包含用户和绑定用户的私密数据
   - 0：只返回用户和绑定用户的打卡记录（需要登录）

**位置范围查询说明**：
- 如果提供了 latitude、longitude、radius 参数，只返回指定范围内的点位
- 使用 Haversine 公式精确计算距离
- radius 范围：0.1 - 1000 公里
- 如果不提供位置参数，返回所有符合条件的点位
    `.trim()
  })
  @ApiResponse({ 
    status: 200, 
    type: [CheckinRecord],
    description: '返回打卡记录数组，已按位置范围过滤（如果提供了位置参数）'
  })
  async getMapMarkers(
    @Req() req: any,
    @Query() queryDto: QueryMapMarkersDto,
  ) {
    // 不强制要求登录，如果有登录信息则使用
    const userId = req.user?.userId || req.user?.id;
    return await this.recordService.getMapMarkers(userId, queryDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取打卡记录详情' })
  @ApiResponse({ status: 200, type: CheckinRecord })
  async findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user?.userId || req.user?.id;
    return await this.recordService.findOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新打卡记录' })
  @ApiResponse({ status: 200, type: CheckinRecord })
  async update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCheckinDto,
  ) {
    const userId = req.user?.userId || req.user?.id;
    return await this.recordService.update(id, userId, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '删除打卡记录' })
  @ApiResponse({ status: 200 })
  async remove(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user?.userId || req.user?.id;
    await this.recordService.remove(id, userId);
    return { message: '删除成功' };
  }
}
