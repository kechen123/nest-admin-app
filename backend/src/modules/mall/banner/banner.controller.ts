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
import { BannerService } from './banner.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { QueryBannerDto } from './dto/query-banner.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination.dto';
import { Banner } from '../../../common/entities/mall/banner.entity';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('轮播图管理')
@Controller('mall/banners')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Post()
  @ApiOperation({ summary: '创建轮播图' })
  @ApiResponse({ status: 201, type: Banner })
  create(@Body() createBannerDto: CreateBannerDto, @Req() req: Request) {
    return this.bannerService.create(createBannerDto, req);
  }

  @Get()
  @ApiOperation({ summary: '分页查询轮播图列表' })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  findAll(@Query() queryDto: QueryBannerDto) {
    return this.bannerService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询轮播图' })
  @ApiResponse({ status: 200, type: Banner })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bannerService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新轮播图' })
  @ApiResponse({ status: 200, type: Banner })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBannerDto: UpdateBannerDto,
    @Req() req: Request,
  ) {
    return this.bannerService.update(id, updateBannerDto, req);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除轮播图' })
  @ApiResponse({ status: 200 })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.bannerService.remove(id, req);
  }
}

