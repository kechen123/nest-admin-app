import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from '../../../common/entities/mall/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { IPaginationResponse } from '../../../common/interfaces/response.interface';
import { OperationLogService } from '../../operation-log/operation-log.service';
import { Request } from 'express';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly operationLogService: OperationLogService,
  ) {}

  /**
   * 创建分类
   */
  async create(createCategoryDto: CreateCategoryDto, req?: Request): Promise<Category> {
    // 如果指定了父分类，验证父分类是否存在
    if (createCategoryDto.parentId && createCategoryDto.parentId > 0) {
      const parent = await this.categoryRepository.findOne({
        where: { id: createCategoryDto.parentId, deletedAt: IsNull() },
      });
      if (!parent) {
        throw new BadRequestException(`父分类 ID ${createCategoryDto.parentId} 不存在`);
      }
    }

    const category = this.categoryRepository.create({
      ...createCategoryDto,
      parentId: createCategoryDto.parentId || 0,
      orderNum: createCategoryDto.orderNum || 0,
      status: createCategoryDto.status !== undefined ? createCategoryDto.status : 1,
    });

    const saved = await this.categoryRepository.save(category);

    // 记录操作日志
    if (req) {
      await this.operationLogService.create({
        title: '商品分类管理',
        businessType: '新增',
        method: 'create',
        requestMethod: 'POST',
        operatorType: 1,
        userId: (req as any).user?.userId,
        username: (req as any).user?.username,
        operUrl: req.url,
        operIp: req.ip,
        operParam: JSON.stringify(createCategoryDto),
        status: 1,
      });
    }

    return saved;
  }

  /**
   * 分页查询分类
   */
  async findAll(queryDto: QueryCategoryDto): Promise<IPaginationResponse<Category>> {
    const { page = 1, pageSize = 10, name, parentId, status } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.categoryRepository.createQueryBuilder('category')
      .leftJoinAndSelect('category.parent', 'parent')
      .where('category.deletedAt IS NULL');

    if (name) {
      queryBuilder.andWhere('category.name LIKE :name', { name: `%${name}%` });
    }
    if (parentId !== undefined) {
      queryBuilder.andWhere('category.parentId = :parentId', { parentId });
    }
    if (status !== undefined) {
      queryBuilder.andWhere('category.status = :status', { status });
    }

    queryBuilder
      .orderBy('category.orderNum', 'ASC')
      .addOrderBy('category.createdAt', 'DESC')
      .skip(skip)
      .take(pageSize);

    const [list, total] = await queryBuilder.getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取分类树
   */
  async findTree(): Promise<Category[]> {
    const categories = await this.categoryRepository.find({
      where: { deletedAt: IsNull() },
      relations: ['children', 'parent'],
      order: {
        orderNum: 'ASC',
        createdAt: 'ASC',
      },
    });

    // 构建树形结构
    const tree: Category[] = [];
    const map = new Map<number, Category>();

    // 先创建所有节点的映射
    categories.forEach((category) => {
      map.set(category.id, { ...category, children: [] });
    });

    // 构建树形结构
    categories.forEach((category) => {
      const node = map.get(category.id)!;
      if (!category.parentId || category.parentId === 0) {
        tree.push(node);
      } else {
        const parent = map.get(category.parentId);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(node);
        }
      }
    });

    return tree;
  }

  /**
   * 根据ID查询分类
   */
  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['parent', 'children'],
    });
    if (!category) {
      throw new NotFoundException(`分类 ID ${id} 不存在`);
    }
    return category;
  }

  /**
   * 更新分类
   */
  async update(id: number, updateCategoryDto: UpdateCategoryDto, req?: Request): Promise<Category> {
    const category = await this.findOne(id);

    // 如果更新了父分类，验证父分类是否存在且不能是自己
    if (updateCategoryDto.parentId !== undefined) {
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException('不能将分类设置为自己的父分类');
      }
      if (updateCategoryDto.parentId > 0) {
        const parent = await this.categoryRepository.findOne({
          where: { id: updateCategoryDto.parentId, deletedAt: IsNull() },
        });
        if (!parent) {
          throw new BadRequestException(`父分类 ID ${updateCategoryDto.parentId} 不存在`);
        }
      }
    }

    Object.assign(category, updateCategoryDto);
    const saved = await this.categoryRepository.save(category);

    // 记录操作日志
    if (req) {
      await this.operationLogService.create({
        title: '商品分类管理',
        businessType: '修改',
        method: 'update',
        requestMethod: 'PATCH',
        operatorType: 1,
        userId: (req as any).user?.userId,
        username: (req as any).user?.username,
        operUrl: req.url,
        operIp: req.ip,
        operParam: JSON.stringify(updateCategoryDto),
        status: 1,
      });
    }

    return saved;
  }

  /**
   * 删除分类（软删除）
   */
  async remove(id: number, req?: Request): Promise<void> {
    const category = await this.findOne(id);

    // 检查是否有子分类
    const children = await this.categoryRepository.find({
      where: { parentId: id, deletedAt: IsNull() },
    });
    if (children.length > 0) {
      throw new BadRequestException('该分类下存在子分类，无法删除');
    }

    // 检查是否有商品使用此分类
    // 这里需要检查 products 表，但为了避免循环依赖，先简单处理
    // 实际项目中可以通过查询 products 表来检查

    await this.categoryRepository.softRemove(category);

    // 记录操作日志
    if (req) {
      await this.operationLogService.create({
        title: '商品分类管理',
        businessType: '删除',
        method: 'remove',
        requestMethod: 'DELETE',
        operatorType: 1,
        userId: (req as any).user?.userId,
        username: (req as any).user?.username,
        operUrl: req.url,
        operIp: req.ip,
        operParam: JSON.stringify({ id }),
        status: 1,
      });
    }
  }
}

