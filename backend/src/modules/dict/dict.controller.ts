import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DictService } from './dict.service';
import { DictData } from './dict-data.entity';
import { DictType } from './dict-type.entity';

@ApiTags('字典管理')
@Controller('dict')
export class DictController {
  constructor(private readonly dictService: DictService) {}

  @Get('types')
  @ApiOperation({ summary: '获取所有字典类型' })
  @ApiResponse({ status: 200, type: [DictType] })
  async getAllDictTypes() {
    return await this.dictService.getAllDictTypes();
  }

  @Get('data/:dictType')
  @ApiOperation({ summary: '根据字典类型获取字典数据' })
  @ApiParam({ name: 'dictType', description: '字典类型', example: 'sys_user_sex' })
  @ApiResponse({ status: 200, type: [DictData] })
  async getDictDataByType(@Param('dictType') dictType: string) {
    return await this.dictService.getDictDataByType(dictType);
  }

  @Get('options/:dictType')
  @ApiOperation({ summary: '根据字典类型获取字典选项（格式化）' })
  @ApiParam({ name: 'dictType', description: '字典类型', example: 'sys_user_sex' })
  @ApiResponse({ status: 200 })
  async getDictOptions(@Param('dictType') dictType: string) {
    return await this.dictService.getDictOptions(dictType);
  }
}

