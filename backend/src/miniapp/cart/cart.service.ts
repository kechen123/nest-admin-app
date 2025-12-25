import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from '../../common/entities/mall/cart-item.entity';
import { ProductSku } from '../../common/entities/mall/product-sku.entity';
import { Product } from '../../common/entities/mall/product.entity';
import { AddCartDto } from './dto/add-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class MiniappCartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(ProductSku)
    private readonly productSkuRepository: Repository<ProductSku>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * 获取购物车列表
   */
  async findAll(userId: number) {
    const cartItems = await this.cartItemRepository.find({
      where: { userId },
      relations: ['sku', 'sku.product'],
      order: { createdAt: 'DESC' },
    });

    return cartItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.sku?.product?.name || '',
      skuId: item.skuId,
      specName: item.sku?.specName || '',
      image: item.sku?.image || item.sku?.product?.mainImage || '',
      price: item.sku?.price || 0,
      quantity: item.quantity,
      isSelected: item.isSelected,
      stock: item.sku?.stock || 0,
    }));
  }

  /**
   * 加入购物车
   */
  async addToCart(userId: number, addCartDto: AddCartDto) {
    const { productId, skuId, quantity } = addCartDto;

    // 验证商品和SKU
    const product = await this.productRepository.findOne({
      where: { id: productId, status: 1 },
    });

    if (!product) {
      throw new NotFoundException('商品不存在或已下架');
    }

    const sku = await this.productSkuRepository.findOne({
      where: { id: skuId, productId, status: 1 },
    });

    if (!sku) {
      throw new NotFoundException('商品规格不存在');
    }

    if (sku.stock < quantity) {
      throw new BadRequestException('库存不足');
    }

    // 检查购物车中是否已存在
    const existingItem = await this.cartItemRepository.findOne({
      where: { userId, skuId },
    });

    if (existingItem) {
      // 更新数量
      existingItem.quantity += quantity;
      if (existingItem.quantity > sku.stock) {
        throw new BadRequestException('库存不足');
      }
      await this.cartItemRepository.save(existingItem);
      return existingItem;
    } else {
      // 创建新记录
      const cartItem = this.cartItemRepository.create({
        userId,
        productId,
        skuId,
        quantity,
        isSelected: 1,
      });
      return await this.cartItemRepository.save(cartItem);
    }
  }

  /**
   * 更新购物车
   */
  async update(userId: number, id: number, updateCartDto: UpdateCartDto) {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id, userId },
      relations: ['sku'],
    });

    if (!cartItem) {
      throw new NotFoundException('购物车项不存在');
    }

    if (updateCartDto.quantity !== undefined) {
      if (updateCartDto.quantity > cartItem.sku.stock) {
        throw new BadRequestException('库存不足');
      }
      cartItem.quantity = updateCartDto.quantity;
    }

    if (updateCartDto.isSelected !== undefined) {
      cartItem.isSelected = updateCartDto.isSelected;
    }

    return await this.cartItemRepository.save(cartItem);
  }

  /**
   * 删除购物车项
   */
  async remove(userId: number, id: number) {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id, userId },
    });

    if (!cartItem) {
      throw new NotFoundException('购物车项不存在');
    }

    await this.cartItemRepository.remove(cartItem);
    return { message: '删除成功' };
  }

  /**
   * 清空购物车
   */
  async clear(userId: number) {
    await this.cartItemRepository.delete({ userId });
    return { message: '清空成功' };
  }

  /**
   * 获取购物车数量
   */
  async getCount(userId: number) {
    const count = await this.cartItemRepository.count({
      where: { userId },
    });
    return { count };
  }
}

