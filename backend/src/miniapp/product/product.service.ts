import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Product } from '../../common/entities/mall/product.entity';
import { ProductSku } from '../../common/entities/mall/product-sku.entity';
import { ProductImage } from '../../common/entities/mall/product-image.entity';
import { Category } from '../../common/entities/mall/category.entity';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class MiniappProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductSku)
    private readonly productSkuRepository: Repository<ProductSku>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * 获取商品列表
   */
  async findAll(queryDto: QueryProductDto) {
    const {
      categoryId,
      keyword,
      isRecommend,
      isNew,
      sortBy = 'time',
      sortOrder = 'desc',
      page = 1,
      pageSize = 10,
    } = queryDto;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .where('product.status = :status', { status: 1 })
      .andWhere('product.deletedAt IS NULL');

    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (keyword) {
      queryBuilder.andWhere('(product.name LIKE :keyword OR product.subtitle LIKE :keyword)', {
        keyword: `%${keyword}%`,
      });
    }

    if (isRecommend !== undefined) {
      queryBuilder.andWhere('product.isRecommend = :isRecommend', { isRecommend });
    }

    if (isNew !== undefined) {
      queryBuilder.andWhere('product.isNew = :isNew', { isNew });
    }

    // 排序
    if (sortBy === 'sales') {
      queryBuilder.orderBy('product.sales', sortOrder.toUpperCase() as 'ASC' | 'DESC');
    } else if (sortBy === 'price') {
      queryBuilder.orderBy('product.minPrice', sortOrder.toUpperCase() as 'ASC' | 'DESC');
    } else {
      queryBuilder.orderBy('product.createdAt', sortOrder.toUpperCase() as 'ASC' | 'DESC');
    }

    // 分页
    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    const [items, total] = await queryBuilder.getManyAndCount();

    // 格式化返回数据
    const formattedItems = items.map((product) => ({
      id: product.id,
      name: product.name,
      subtitle: product.subtitle,
      mainImage: product.mainImage,
      minPrice: product.minPrice,
      maxPrice: product.maxPrice,
      sales: product.sales,
      stock: product.stock,
      isRecommend: product.isRecommend,
      isNew: product.isNew,
    }));

    return {
      items: formattedItems,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取商品详情
   */
  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id, status: 1 },
      relations: ['category', 'skus', 'images'],
    });

    if (!product) {
      throw new NotFoundException('商品不存在或已下架');
    }

    // 格式化SKU数据
    const skus = product.skus
      ?.filter((sku) => sku.status === 1)
      .map((sku) => ({
        id: sku.id,
        skuCode: sku.skuCode,
        specName: sku.specName,
        specValues: JSON.parse(sku.specValues || '{}'),
        price: sku.price,
        originalPrice: sku.originalPrice,
        stock: sku.stock,
        image: sku.image,
      })) || [];

    // 格式化图片数据
    const images = product.images
      ?.sort((a, b) => a.sortOrder - b.sortOrder)
      .map((img) => img.url) || [];

    return {
      id: product.id,
      name: product.name,
      subtitle: product.subtitle,
      categoryId: product.categoryId,
      categoryName: product.category?.name,
      mainImage: product.mainImage,
      images,
      detail: product.detail,
      minPrice: product.minPrice,
      maxPrice: product.maxPrice,
      sales: product.sales,
      stock: product.stock,
      isRecommend: product.isRecommend,
      isNew: product.isNew,
      skus,
    };
  }

  /**
   * 获取推荐商品
   */
  async getRecommendProducts(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    const [products, total] = await this.productRepository.findAndCount({
      where: { status: 1, isRecommend: 1 },
      order: { sales: 'DESC' },
      skip,
      take: pageSize,
    });

    const items = products.map((product) => ({
      id: product.id,
      name: product.name,
      subtitle: product.subtitle,
      mainImage: product.mainImage,
      minPrice: product.minPrice,
      maxPrice: product.maxPrice,
      sales: product.sales, // 总销量
      stock: product.stock, // 总库存
      isNew: product.isNew,
    }));

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取新品
   */
  async getNewProducts(limit: number = 10) {
    const products = await this.productRepository.find({
      where: { status: 1, isNew: 1 },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      mainImage: product.mainImage,
      minPrice: product.minPrice,
      maxPrice: product.maxPrice,
      sales: product.sales,
    }));
  }

  /**
   * 获取分类列表（树形结构，包含二级分类）
   */
  async getCategories() {
    // 查询所有启用的分类
    const allCategories = await this.categoryRepository.find({
      where: { status: 1 },
      order: { orderNum: 'ASC' },
    });

    // 构建树形结构
    const tree: Array<{
      id: number;
      name: string;
      icon?: string;
      children?: Array<{ id: number; name: string; icon?: string }>;
    }> = [];

    // 先找出所有一级分类（parentId === 0）
    const rootCategories = allCategories.filter((cat) => cat.parentId === 0);

    // 为每个一级分类查找其子分类
    rootCategories.forEach((rootCategory) => {
      const children = allCategories
        .filter((cat) => cat.parentId === rootCategory.id)
        .map((child) => ({
          id: child.id,
          name: child.name,
          icon: child.icon,
        }));

      const categoryNode: {
        id: number;
        name: string;
        icon?: string;
        children?: Array<{ id: number; name: string; icon?: string }>;
      } = {
        id: rootCategory.id,
        name: rootCategory.name,
        icon: rootCategory.icon,
      };

      // 如果有子分类，添加 children 字段
      if (children.length > 0) {
        categoryNode.children = children;
      }

      tree.push(categoryNode);
    });

    return tree;
  }
}

