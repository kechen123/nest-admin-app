import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Product } from '../../../common/entities/mall/product.entity';
import { Category } from '../../../common/entities/mall/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { IPaginationResponse } from '../../../common/interfaces/response.interface';
import { OperationLogService } from '../../operation-log/operation-log.service';
import { Request } from 'express';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly operationLogService: OperationLogService,
  ) {}

  /**
   * 创建商品
   */
  async create(createProductDto: CreateProductDto, req?: Request): Promise<Product> {
    // 验证分类是否存在
    const category = await this.categoryRepository.findOne({
      where: { id: createProductDto.categoryId, deletedAt: IsNull() },
    });
    if (!category) {
      throw new BadRequestException(`分类 ID ${createProductDto.categoryId} 不存在`);
    }

    const product = this.productRepository.create({
      ...createProductDto,
      sortOrder: createProductDto.sortOrder || 0,
      isRecommend: createProductDto.isRecommend || 0,
      isNew: createProductDto.isNew || 0,
      status: createProductDto.status !== undefined ? createProductDto.status : 1,
      minPrice: 0,
      maxPrice: 0,
      sales: 0,
      stock: 0,
    });

    const saved = await this.productRepository.save(product);

    // 记录操作日志
    if (req) {
      await this.operationLogService.create({
        title: '商品管理',
        businessType: '新增',
        method: 'create',
        requestMethod: 'POST',
        operatorType: 1,
        userId: (req as any).user?.userId,
        username: (req as any).user?.username,
        operUrl: req.url,
        operIp: req.ip,
        operParam: JSON.stringify(createProductDto),
        status: 1,
      });
    }

    return saved;
  }

  /**
   * 分页查询商品
   */
  async findAll(queryDto: QueryProductDto): Promise<IPaginationResponse<Product>> {
    const { page = 1, pageSize = 10, name, categoryId, status, isRecommend, isNew } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.deletedAt IS NULL');

    if (name) {
      queryBuilder.andWhere('product.name LIKE :name', { name: `%${name}%` });
    }
    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }
    if (status !== undefined) {
      queryBuilder.andWhere('product.status = :status', { status });
    }
    if (isRecommend !== undefined) {
      queryBuilder.andWhere('product.isRecommend = :isRecommend', { isRecommend });
    }
    if (isNew !== undefined) {
      queryBuilder.andWhere('product.isNew = :isNew', { isNew });
    }

    queryBuilder
      .orderBy('product.sortOrder', 'ASC')
      .addOrderBy('product.createdAt', 'DESC')
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
   * 根据ID查询商品
   */
  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['category', 'skus', 'images'],
    });
    if (!product) {
      throw new NotFoundException(`商品 ID ${id} 不存在`);
    }
    return product;
  }

  /**
   * 更新商品
   */
  async update(id: number, updateProductDto: UpdateProductDto, req?: Request): Promise<Product> {
    const product = await this.findOne(id);

    // 如果更新了分类，验证分类是否存在
    if (updateProductDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateProductDto.categoryId, deletedAt: IsNull() },
      });
      if (!category) {
        throw new BadRequestException(`分类 ID ${updateProductDto.categoryId} 不存在`);
      }
    }

    Object.assign(product, updateProductDto);
    const saved = await this.productRepository.save(product);

    // 记录操作日志
    if (req) {
      await this.operationLogService.create({
        title: '商品管理',
        businessType: '修改',
        method: 'update',
        requestMethod: 'PATCH',
        operatorType: 1,
        userId: (req as any).user?.userId,
        username: (req as any).user?.username,
        operUrl: req.url,
        operIp: req.ip,
        operParam: JSON.stringify(updateProductDto),
        status: 1,
      });
    }

    return saved;
  }

  /**
   * 更新商品状态（上架/下架）
   */
  async updateStatus(id: number, status: number, req?: Request): Promise<Product> {
    const product = await this.findOne(id);
    product.status = status;
    const saved = await this.productRepository.save(product);

    // 记录操作日志
    if (req) {
      await this.operationLogService.create({
        title: '商品管理',
        businessType: status === 1 ? '上架' : '下架',
        method: 'updateStatus',
        requestMethod: 'PATCH',
        operatorType: 1,
        userId: (req as any).user?.userId,
        username: (req as any).user?.username,
        operUrl: req.url,
        operIp: req.ip,
        operParam: JSON.stringify({ id, status }),
        status: 1,
      });
    }

    return saved;
  }

  /**
   * 删除商品（软删除）
   */
  async remove(id: number, req?: Request): Promise<void> {
    const product = await this.findOne(id);

    // 检查是否有订单使用此商品
    // 这里需要检查 order_items 表，但为了避免循环依赖，先简单处理
    // 实际项目中可以通过查询 order_items 表来检查

    await this.productRepository.softRemove(product);

    // 记录操作日志
    if (req) {
      await this.operationLogService.create({
        title: '商品管理',
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

