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
import { CheckinRecord } from './checkin-record.entity';
import { PaginationResponseDto } from '../../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

@ApiTags('打卡记录')
@Controller('miniapp/checkin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CheckinRecordController {
  constructor(private readonly recordService: CheckinRecordService) {}

  @Post()
  @ApiOperation({ summary: '创建打卡记录' })
  @ApiResponse({ status: 201, type: CheckinRecord })
  async create(@Req() req: any, @Body() createDto: CreateCheckinDto) {
    const userId = req.user?.userId || req.user?.id;
    return await this.recordService.create(userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: '分页查询打卡记录' })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  async findAll(@Req() req: any, @Query() queryDto: QueryCheckinDto) {
    const userId = req.user?.userId || req.user?.id;
    return await this.recordService.findAll(queryDto, userId);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取打卡统计' })
  @ApiResponse({ status: 200 })
  async getStatistics(@Req() req: any) {
    const userId = req.user?.userId || req.user?.id;
    return await this.recordService.getStatistics(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取打卡记录详情' })
  @ApiResponse({ status: 200, type: CheckinRecord })
  async findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user?.userId || req.user?.id;
    return await this.recordService.findOne(id, userId);
  }

  @Patch(':id')
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
  @ApiOperation({ summary: '删除打卡记录' })
  @ApiResponse({ status: 200 })
  async remove(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user?.userId || req.user?.id;
    await this.recordService.remove(id, userId);
    return { message: '删除成功' };
  }
}
