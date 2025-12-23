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
import { DictService } from './dict.service';
import { CreateDictTypeDto } from './dto/create-dict-type.dto';
import { UpdateDictTypeDto } from './dto/update-dict-type.dto';
import { QueryDictTypeDto } from './dto/query-dict-type.dto';
import { CreateDictDataDto } from './dto/create-dict-data.dto';
import { UpdateDictDataDto } from './dto/update-dict-data.dto';
import { QueryDictDataDto } from './dto/query-dict-data.dto';
import { PaginationResponseDto } from '../../common/dto/pagination.dto';
import { DictData } from './dict-data.entity';
import { DictType } from './dict-type.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('字典管理')
@Controller('dict')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DictController {
  constructor(private readonly dictService: DictService) {}

  // ==================== 字典类型管理 ====================

  @Post('types')
  @ApiOperation({ summary: '创建字典类型' })
  @ApiResponse({ status: 201, type: DictType })
  createDictType(@Body() createDictTypeDto: CreateDictTypeDto) {
    return this.dictService.createDictType(createDictTypeDto);
  }

  @Get('types/all')
  @ApiOperation({ summary: '获取所有字典类型（不分页，用于下拉选择）' })
  @ApiResponse({ status: 200, type: [DictType] })
  getAllDictTypes() {
    return this.dictService.getAllDictTypes();
  }

  @Get('types')
  @ApiOperation({ summary: '分页查询字典类型列表' })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  findAllDictTypes(@Query() queryDto: QueryDictTypeDto) {
    return this.dictService.findAllDictTypes(queryDto);
  }

  @Get('types/:id')
  @ApiOperation({ summary: '根据ID查询字典类型' })
  @ApiResponse({ status: 200, type: DictType })
  findDictTypeById(@Param('id', ParseIntPipe) id: number) {
    return this.dictService.findDictTypeById(id);
  }

  @Patch('types/:id')
  @ApiOperation({ summary: '更新字典类型' })
  @ApiResponse({ status: 200, type: DictType })
  updateDictType(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDictTypeDto: UpdateDictTypeDto,
  ) {
    return this.dictService.updateDictType(id, updateDictTypeDto);
  }

  @Delete('types/:id')
  @ApiOperation({ summary: '删除字典类型' })
  @ApiResponse({ status: 200 })
  removeDictType(@Param('id', ParseIntPipe) id: number) {
    return this.dictService.removeDictType(id);
  }

  // ==================== 字典数据管理 ====================

  @Post('data')
  @ApiOperation({ summary: '创建字典数据' })
  @ApiResponse({ status: 201, type: DictData })
  createDictData(@Body() createDictDataDto: CreateDictDataDto) {
    return this.dictService.createDictData(createDictDataDto);
  }

  @Get('data')
  @ApiOperation({ summary: '分页查询字典数据列表' })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  findAllDictData(@Query() queryDto: QueryDictDataDto) {
    return this.dictService.findAllDictData(queryDto);
  }

  @Get('data/:dictType')
  @ApiOperation({ summary: '根据字典类型获取字典数据（不分页）' })
  @ApiResponse({ status: 200, type: [DictData] })
  getDictDataByType(@Param('dictType') dictType: string) {
    return this.dictService.getDictDataByType(dictType);
  }

  @Get('data/id/:id')
  @ApiOperation({ summary: '根据ID查询字典数据' })
  @ApiResponse({ status: 200, type: DictData })
  findDictDataById(@Param('id', ParseIntPipe) id: number) {
    return this.dictService.findDictDataById(id);
  }

  @Patch('data/:id')
  @ApiOperation({ summary: '更新字典数据' })
  @ApiResponse({ status: 200, type: DictData })
  updateDictData(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDictDataDto: UpdateDictDataDto,
  ) {
    return this.dictService.updateDictData(id, updateDictDataDto);
  }

  @Delete('data/:id')
  @ApiOperation({ summary: '删除字典数据' })
  @ApiResponse({ status: 200 })
  removeDictData(@Param('id', ParseIntPipe) id: number) {
    return this.dictService.removeDictData(id);
  }

  // ==================== 字典选项（格式化） ====================

  @Get('options/:dictType')
  @ApiOperation({ summary: '根据字典类型获取字典选项（格式化）' })
  @ApiResponse({ status: 200 })
  getDictOptions(@Param('dictType') dictType: string) {
    return this.dictService.getDictOptions(dictType);
  }
}

