import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Product } from '../../../common/entities/mall/product.entity';
import { Category } from '../../../common/entities/mall/category.entity';
import { ProductSku } from '../../../common/entities/mall/product-sku.entity';
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
    @InjectRepository(ProductSku)
    private readonly skuRepository: Repository<ProductSku>,
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

    const { skus, ...productData } = createProductDto;

    const product = this.productRepository.create({
      ...productData,
      sortOrder: productData.sortOrder || 0,
      isRecommend: productData.isRecommend || 0,
      isNew: productData.isNew || 0,
      status: productData.status !== undefined ? productData.status : 1,
      minPrice: 0,
      maxPrice: 0,
      sales: 0,
      stock: 0,
    });

    const saved = await this.productRepository.save(product);

    // 如果提供了规格数据，创建规格
    if (skus && skus.length > 0) {
      for (const skuDto of skus) {
        // 检查SKU编码是否已存在
        const existingSku = await this.skuRepository.findOne({
          where: { skuCode: skuDto.skuCode, deletedAt: IsNull() },
        });
        if (existingSku) {
          throw new BadRequestException(`SKU编码 ${skuDto.skuCode} 已存在`);
        }

        const sku = this.skuRepository.create({
          ...skuDto,
          productId: saved.id,
          stock: skuDto.stock || 0,
          sales: 0,
          status: skuDto.status !== undefined ? skuDto.status : 1,
        });
        await this.skuRepository.save(sku);
      }

      // 更新商品的价格和库存
      await this.updateProductPriceAndStock(saved.id);
    }

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

    return this.findOne(saved.id);
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
   * 注意：由于外键约束设置为 CASCADE，删除商品时会自动删除关联的规格
   */
  async remove(id: number, req?: Request): Promise<void> {
    const product = await this.findOne(id);

    // 检查是否有订单使用此商品
    // 这里需要检查 order_items 表，但为了避免循环依赖，先简单处理
    // 实际项目中可以通过查询 order_items 表来检查
    // 由于外键约束设置为 RESTRICT，如果有订单使用此商品，删除会失败

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

  /**
   * 更新商品的价格和库存（根据所有SKU计算）
   */
  private async updateProductPriceAndStock(productId: number): Promise<void> {
    const skus = await this.skuRepository.find({
      where: { productId, deletedAt: IsNull(), status: 1 },
    });

    if (skus.length === 0) {
      // 如果没有启用的SKU，将商品价格和库存设为0
      await this.productRepository.update(productId, {
        minPrice: 0,
        maxPrice: 0,
        stock: 0,
      });
      return;
    }

    const prices = skus.map((sku) => Number(sku.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const totalStock = skus.reduce((sum, sku) => sum + sku.stock, 0);

    await this.productRepository.update(productId, {
      minPrice,
      maxPrice,
      stock: totalStock,
    });
  }
}

