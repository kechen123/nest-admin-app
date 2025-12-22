import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DictData } from './dict-data.entity';
import { DictType } from './dict-type.entity';

@Injectable()
export class DictService {
  constructor(
    @InjectRepository(DictData)
    private readonly dictDataRepository: Repository<DictData>,
    @InjectRepository(DictType)
    private readonly dictTypeRepository: Repository<DictType>,
  ) {}

  /**
   * 根据字典类型获取字典数据列表
   */
  async getDictDataByType(dictType: string): Promise<DictData[]> {
    return await this.dictDataRepository.find({
      where: {
        dictType,
        status: 1,
      },
      order: {
        dictSort: 'ASC',
      },
    });
  }

  /**
   * 获取所有字典类型
   */
  async getAllDictTypes(): Promise<DictType[]> {
    return await this.dictTypeRepository.find({
      where: {
        status: 1,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * 根据字典类型获取字典数据（返回格式化的选项数组）
   */
  async getDictOptions(dictType: string): Promise<Array<{ label: string; value: string; tagType?: string }>> {
    const dictDataList = await this.getDictDataByType(dictType);
    return dictDataList.map((item) => ({
      label: item.dictLabel,
      value: item.dictValue,
      tagType: item.listClass || undefined, // 使用 list_class 作为 tagType
    }));
  }
}

