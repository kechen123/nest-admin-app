import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ProductSku } from '../../../common/entities/mall/product-sku.entity';
import { Product } from '../../../common/entities/mall/product.entity';
import { CreateProductSkuDto } from './dto/create-product-sku.dto';
import { UpdateProductSkuDto } from './dto/update-product-sku.dto';
import { QueryProductSkuDto } from './dto/query-product-sku.dto';
import { IPaginationResponse } from '../../../common/interfaces/response.interface';
import { OperationLogService } from '../../operation-log/operation-log.service';
import { Request } from 'express';

@Injectable()
export class ProductSkuService {
  constructor(
    @InjectRepository(ProductSku)
    private readonly skuRepository: Repository<ProductSku>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly operationLogService: OperationLogService,
  ) {}

  /**
   * 创建SKU
   */
  async create(createSkuDto: CreateProductSkuDto, req?: Request): Promise<ProductSku> {
    // 验证商品是否存在
    const product = await this.productRepository.findOne({
      where: { id: createSkuDto.productId, deletedAt: IsNull() },
    });
    if (!product) {
      throw new BadRequestException(`商品 ID ${createSkuDto.productId} 不存在`);
    }

    // 检查SKU编码是否已存在
    const existingSku = await this.skuRepository.findOne({
      where: { skuCode: createSkuDto.skuCode, deletedAt: IsNull() },
    });
    if (existingSku) {
      throw new BadRequestException(`SKU编码 ${createSkuDto.skuCode} 已存在`);
    }

    const sku = this.skuRepository.create({
      ...createSkuDto,
      stock: createSkuDto.stock || 0,
      sales: 0,
      status: createSkuDto.status !== undefined ? createSkuDto.status : 1,
    });

    const saved = await this.skuRepository.save(sku);

    // 更新商品的价格和库存
    await this.updateProductPriceAndStock(createSkuDto.productId);

    // 记录操作日志
    if (req) {
      await this.operationLogService.create({
        title: '商品规格管理',
        businessType: '新增',
        method: 'create',
        requestMethod: 'POST',
        operatorType: 1,
        userId: (req as any).user?.userId,
        username: (req as any).user?.username,
        operUrl: req.url,
        operIp: req.ip,
        operParam: JSON.stringify(createSkuDto),
        status: 1,
      });
    }

    return saved;
  }

  /**
   * 分页查询SKU
   */
  async findAll(queryDto: QueryProductSkuDto): Promise<IPaginationResponse<ProductSku>> {
    const { page = 1, pageSize = 10, productId, productName, status } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.skuRepository.createQueryBuilder('sku')
      .leftJoinAndSelect('sku.product', 'product')
      .where('sku.deletedAt IS NULL');

    if (productId) {
      queryBuilder.andWhere('sku.productId = :productId', { productId });
    }
    if (productName) {
      queryBuilder.andWhere('product.name LIKE :productName', { productName: `%${productName}%` });
    }
    if (status !== undefined) {
      queryBuilder.andWhere('sku.status = :status', { status });
    }

    queryBuilder
      .orderBy('sku.createdAt', 'DESC')
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
   * 根据ID查询SKU
   */
  async findOne(id: number): Promise<ProductSku> {
    const sku = await this.skuRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['product'],
    });
    if (!sku) {
      throw new NotFoundException(`SKU ID ${id} 不存在`);
    }
    return sku;
  }

  /**
   * 根据商品ID查询所有SKU
   */
  async findByProductId(productId: number): Promise<ProductSku[]> {
    return this.skuRepository.find({
      where: { productId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 更新SKU
   */
  async update(id: number, updateSkuDto: UpdateProductSkuDto, req?: Request): Promise<ProductSku> {
    const sku = await this.findOne(id);

    // 如果更新了商品ID，验证商品是否存在
    if (updateSkuDto.productId && updateSkuDto.productId !== sku.productId) {
      const product = await this.productRepository.findOne({
        where: { id: updateSkuDto.productId, deletedAt: IsNull() },
      });
      if (!product) {
        throw new BadRequestException(`商品 ID ${updateSkuDto.productId} 不存在`);
      }
    }

    // 如果更新了SKU编码，检查是否重复
    if (updateSkuDto.skuCode && updateSkuDto.skuCode !== sku.skuCode) {
      const existingSku = await this.skuRepository.findOne({
        where: { skuCode: updateSkuDto.skuCode, deletedAt: IsNull() },
      });
      if (existingSku) {
        throw new BadRequestException(`SKU编码 ${updateSkuDto.skuCode} 已存在`);
      }
    }

    Object.assign(sku, updateSkuDto);
    const saved = await this.skuRepository.save(sku);

    // 更新商品的价格和库存
    await this.updateProductPriceAndStock(sku.productId);

    // 记录操作日志
    if (req) {
      await this.operationLogService.create({
        title: '商品规格管理',
        businessType: '修改',
        method: 'update',
        requestMethod: 'PATCH',
        operatorType: 1,
        userId: (req as any).user?.userId,
        username: (req as any).user?.username,
        operUrl: req.url,
        operIp: req.ip,
        operParam: JSON.stringify(updateSkuDto),
        status: 1,
      });
    }

    return saved;
  }

  /**
   * 更新SKU状态
   */
  async updateStatus(id: number, status: number, req?: Request): Promise<ProductSku> {
    const sku = await this.findOne(id);
    sku.status = status;
    const saved = await this.skuRepository.save(sku);

    // 记录操作日志
    if (req) {
      await this.operationLogService.create({
        title: '商品规格管理',
        businessType: status === 1 ? '启用' : '禁用',
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
   * 删除SKU（软删除）
   */
  async remove(id: number, req?: Request): Promise<void> {
    const sku = await this.findOne(id);
    const productId = sku.productId;

    await this.skuRepository.softRemove(sku);

    // 更新商品的价格和库存
    await this.updateProductPriceAndStock(productId);

    // 记录操作日志
    if (req) {
      await this.operationLogService.create({
        title: '商品规格管理',
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
   * 批量创建SKU
   */
  async createBatch(productId: number, skus: CreateProductSkuDto[], req?: Request): Promise<ProductSku[]> {
    // 验证商品是否存在
    const product = await this.productRepository.findOne({
      where: { id: productId, deletedAt: IsNull() },
    });
    if (!product) {
      throw new BadRequestException(`商品 ID ${productId} 不存在`);
    }

    const createdSkus: ProductSku[] = [];
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
        productId,
        stock: skuDto.stock || 0,
        sales: 0,
        status: skuDto.status !== undefined ? skuDto.status : 1,
      });

      const saved = await this.skuRepository.save(sku);
      createdSkus.push(saved);
    }

    // 更新商品的价格和库存
    await this.updateProductPriceAndStock(productId);

    // 记录操作日志
    if (req) {
      await this.operationLogService.create({
        title: '商品规格管理',
        businessType: '批量新增',
        method: 'createBatch',
        requestMethod: 'POST',
        operatorType: 1,
        userId: (req as any).user?.userId,
        username: (req as any).user?.username,
        operUrl: req.url,
        operIp: req.ip,
        operParam: JSON.stringify({ productId, skus }),
        status: 1,
      });
    }

    return createdSkus;
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

