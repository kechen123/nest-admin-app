import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull } from 'typeorm';
import { DictData } from './dict-data.entity';
import { DictType } from './dict-type.entity';
import { CreateDictTypeDto } from './dto/create-dict-type.dto';
import { UpdateDictTypeDto } from './dto/update-dict-type.dto';
import { QueryDictTypeDto } from './dto/query-dict-type.dto';
import { CreateDictDataDto } from './dto/create-dict-data.dto';
import { UpdateDictDataDto } from './dto/update-dict-data.dto';
import { QueryDictDataDto } from './dto/query-dict-data.dto';
import { IPaginationResponse } from '../../common/interfaces/response.interface';

@Injectable()
export class DictService {
  constructor(
    @InjectRepository(DictData)
    private readonly dictDataRepository: Repository<DictData>,
    @InjectRepository(DictType)
    private readonly dictTypeRepository: Repository<DictType>,
  ) {}

  // ==================== 字典类型管理 ====================

  /**
   * 创建字典类型
   */
  async createDictType(createDictTypeDto: CreateDictTypeDto): Promise<DictType> {
    // 检查字典类型是否已存在
    const existing = await this.dictTypeRepository.findOne({
      where: { dictType: createDictTypeDto.dictType, deletedAt: IsNull() },
    });
    if (existing) {
      throw new BadRequestException(`字典类型 ${createDictTypeDto.dictType} 已存在`);
    }

    const dictType = this.dictTypeRepository.create({
      ...createDictTypeDto,
      status: createDictTypeDto.status !== undefined ? createDictTypeDto.status : 1,
    });

    return await this.dictTypeRepository.save(dictType);
  }

  /**
   * 分页查询字典类型
   */
  async findAllDictTypes(queryDto: QueryDictTypeDto): Promise<IPaginationResponse<DictType>> {
    const { page = 1, pageSize = 10, dictName, dictType, status } = queryDto;
    const skip = (page - 1) * pageSize;

    const where: any = {
      deletedAt: IsNull(),
    };
    if (dictName) {
      where.dictName = Like(`%${dictName}%`);
    }
    if (dictType) {
      where.dictType = Like(`%${dictType}%`);
    }
    if (status !== undefined) {
      where.status = status;
    }

    const [list, total] = await this.dictTypeRepository.findAndCount({
      where,
      skip,
      take: pageSize,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取所有字典类型（不分页，用于下拉选择）
   */
  async getAllDictTypes(): Promise<DictType[]> {
    return await this.dictTypeRepository.find({
      where: {
        deletedAt: IsNull(),
        status: 1,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * 根据ID查询字典类型
   */
  async findDictTypeById(id: number): Promise<DictType> {
    const dictType = await this.dictTypeRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
    if (!dictType) {
      throw new NotFoundException(`字典类型 ID ${id} 不存在`);
    }
    return dictType;
  }

  /**
   * 更新字典类型
   */
  async updateDictType(id: number, updateDictTypeDto: UpdateDictTypeDto): Promise<DictType> {
    const dictType = await this.findDictTypeById(id);

    // 如果更新了字典类型，检查是否重复
    if (updateDictTypeDto.dictType && updateDictTypeDto.dictType !== dictType.dictType) {
      const existing = await this.dictTypeRepository.findOne({
        where: { dictType: updateDictTypeDto.dictType, deletedAt: IsNull() },
      });
      if (existing) {
        throw new BadRequestException(`字典类型 ${updateDictTypeDto.dictType} 已存在`);
      }
      // 如果更新了字典类型，需要同步更新关联的字典数据
      await this.dictDataRepository.update(
        { dictType: dictType.dictType },
        { dictType: updateDictTypeDto.dictType }
      );
    }

    Object.assign(dictType, updateDictTypeDto);
    return await this.dictTypeRepository.save(dictType);
  }

  /**
   * 删除字典类型（软删除）
   */
  async removeDictType(id: number): Promise<void> {
    const dictType = await this.findDictTypeById(id);

    // 检查是否有字典数据使用此类型
    const dataCount = await this.dictDataRepository.count({
      where: {
        dictType: dictType.dictType,
        deletedAt: IsNull(),
      },
    });

    if (dataCount > 0) {
      throw new BadRequestException('字典类型存在字典数据，无法删除');
    }

    await this.dictTypeRepository.softRemove(dictType);
  }

  // ==================== 字典数据管理 ====================

  /**
   * 创建字典数据
   */
  async createDictData(createDictDataDto: CreateDictDataDto): Promise<DictData> {
    // 检查字典类型是否存在
    const dictType = await this.dictTypeRepository.findOne({
      where: { dictType: createDictDataDto.dictType, deletedAt: IsNull() },
    });
    if (!dictType) {
      throw new BadRequestException(`字典类型 ${createDictDataDto.dictType} 不存在`);
    }

    // 检查同一字典类型下，字典键值是否重复
    const existing = await this.dictDataRepository.findOne({
      where: {
        dictType: createDictDataDto.dictType,
        dictValue: createDictDataDto.dictValue,
        deletedAt: IsNull(),
      },
    });
    if (existing) {
      throw new BadRequestException(`字典键值 ${createDictDataDto.dictValue} 已存在`);
    }

    const dictData = this.dictDataRepository.create({
      ...createDictDataDto,
      dictSort: createDictDataDto.dictSort || 0,
      isDefault: createDictDataDto.isDefault !== undefined ? createDictDataDto.isDefault : 0,
      status: createDictDataDto.status !== undefined ? createDictDataDto.status : 1,
    });

    return await this.dictDataRepository.save(dictData);
  }

  /**
   * 分页查询字典数据
   */
  async findAllDictData(queryDto: QueryDictDataDto): Promise<IPaginationResponse<DictData>> {
    const { page = 1, pageSize = 10, dictType, dictLabel, status } = queryDto;
    const skip = (page - 1) * pageSize;

    const where: any = {
      deletedAt: IsNull(),
    };
    if (dictType) {
      where.dictType = dictType;
    }
    if (dictLabel) {
      where.dictLabel = Like(`%${dictLabel}%`);
    }
    if (status !== undefined) {
      where.status = status;
    }

    const [list, total] = await this.dictDataRepository.findAndCount({
      where,
      skip,
      take: pageSize,
      order: {
        dictSort: 'ASC',
        createdAt: 'DESC',
      },
    });

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 根据字典类型获取字典数据列表（不分页）
   */
  async getDictDataByType(dictType: string): Promise<DictData[]> {
    return await this.dictDataRepository.find({
      where: {
        dictType,
        deletedAt: IsNull(),
        status: 1,
      },
      order: {
        dictSort: 'ASC',
      },
    });
  }

  /**
   * 根据ID查询字典数据
   */
  async findDictDataById(id: number): Promise<DictData> {
    const dictData = await this.dictDataRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
    if (!dictData) {
      throw new NotFoundException(`字典数据 ID ${id} 不存在`);
    }
    return dictData;
  }

  /**
   * 更新字典数据
   */
  async updateDictData(id: number, updateDictDataDto: UpdateDictDataDto): Promise<DictData> {
    const dictData = await this.findDictDataById(id);

    // 如果更新了字典类型，检查是否存在
    if (updateDictDataDto.dictType && updateDictDataDto.dictType !== dictData.dictType) {
      const dictType = await this.dictTypeRepository.findOne({
        where: { dictType: updateDictDataDto.dictType, deletedAt: IsNull() },
      });
      if (!dictType) {
        throw new BadRequestException(`字典类型 ${updateDictDataDto.dictType} 不存在`);
      }
    }

    // 如果更新了字典键值，检查是否重复
    if (updateDictDataDto.dictValue && updateDictDataDto.dictValue !== dictData.dictValue) {
      const targetDictType = updateDictDataDto.dictType || dictData.dictType;
      const existing = await this.dictDataRepository.findOne({
        where: {
          dictType: targetDictType,
          dictValue: updateDictDataDto.dictValue,
          deletedAt: IsNull(),
        },
      });
      if (existing) {
        throw new BadRequestException(`字典键值 ${updateDictDataDto.dictValue} 已存在`);
      }
    }

    Object.assign(dictData, updateDictDataDto);
    return await this.dictDataRepository.save(dictData);
  }

  /**
   * 删除字典数据（软删除）
   */
  async removeDictData(id: number): Promise<void> {
    const dictData = await this.findDictDataById(id);
    await this.dictDataRepository.softRemove(dictData);
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

