import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order } from '../../common/entities/mall/order.entity';
import { OrderItem } from '../../common/entities/mall/order-item.entity';
import { CartItem } from '../../common/entities/mall/cart-item.entity';
import { Address } from '../../common/entities/mall/address.entity';
import { ProductSku } from '../../common/entities/mall/product-sku.entity';
import { Product } from '../../common/entities/mall/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class MiniappOrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(ProductSku)
    private readonly productSkuRepository: Repository<ProductSku>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  /**
   * 生成订单号
   */
  private generateOrderNo(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    return `${year}${month}${day}${random}`;
  }

  /**
   * 创建订单
   */
  async create(userId: number, createOrderDto: CreateOrderDto) {
    const { addressId, items, cartItemIds, productId, skuId, quantity, remark, payType } = createOrderDto;

    // 验证地址（如果提供了地址ID）
    let address = null;
    if (addressId) {
      address = await this.addressRepository.findOne({
        where: { id: addressId, userId },
      });

      if (!address) {
        throw new NotFoundException('收货地址不存在');
      }
    }

    let orderItems: any[] = [];
    let totalAmount = 0;

    // 从 items 数组下单（前端直接传递商品列表）
    if (items && items.length > 0) {
      for (const item of items) {
        const product = await this.productRepository.findOne({
          where: { id: item.productId, status: 1 },
        });

        if (!product) {
          throw new NotFoundException(`商品 ${item.productName} 不存在或已下架`);
        }

        const sku = await this.productSkuRepository.findOne({
          where: { id: item.skuId, productId: item.productId, status: 1 },
        });

        if (!sku) {
          throw new NotFoundException(`商品规格不存在`);
        }

        if (sku.stock < item.quantity) {
          throw new BadRequestException(`商品 ${item.productName} 库存不足`);
        }

        const subtotal = Number(item.price) * item.quantity;
        totalAmount += subtotal;

        orderItems.push({
          productId: item.productId,
          productName: item.productName,
          skuId: item.skuId,
          specName: item.specValues || sku.specName,
          image: sku.image || product.mainImage,
          price: item.price,
          quantity: item.quantity,
          subtotal,
        });
      }
    }
    // 从购物车下单
    else if (cartItemIds && cartItemIds.length > 0) {
      const cartItems = await this.cartItemRepository.find({
        where: { id: In(cartItemIds), userId, isSelected: 1 },
        relations: ['sku', 'sku.product'],
      });

      if (cartItems.length === 0) {
        throw new BadRequestException('请选择要购买的商品');
      }

      for (const cartItem of cartItems) {
        if (!cartItem.sku || cartItem.sku.stock < cartItem.quantity) {
          throw new BadRequestException(`商品 ${cartItem.sku?.product?.name || ''} 库存不足`);
        }

        const subtotal = Number(cartItem.sku.price) * cartItem.quantity;
        totalAmount += subtotal;

        orderItems.push({
          productId: cartItem.productId,
          productName: cartItem.sku.product.name,
          skuId: cartItem.skuId,
          specName: cartItem.sku.specName,
          image: cartItem.sku.image || cartItem.sku.product.mainImage,
          price: cartItem.sku.price,
          quantity: cartItem.quantity,
          subtotal,
        });
      }
    }
    // 直接购买（单个商品）
    else if (productId && skuId && quantity) {
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

      const subtotal = Number(sku.price) * quantity;
      totalAmount = subtotal;

      orderItems.push({
        productId,
        productName: product.name,
        skuId,
        specName: sku.specName,
        image: sku.image || product.mainImage,
        price: sku.price,
        quantity,
        subtotal,
      });
    } else {
      throw new BadRequestException('请选择要购买的商品');
    }

    // 计算运费和优惠（这里简化处理，实际需要根据业务规则计算）
    const shippingFee = 0;
    const discountAmount = 0;
    const payAmount = totalAmount + shippingFee - discountAmount;

    // 创建订单（处理可选地址和支付）
    const orderData: Partial<Order> = {
      orderNo: this.generateOrderNo(),
      userId,
      status: payType ? 0 : 1, // 如果未支付，直接设为待发货；如果支付了，设为待付款
      totalAmount,
      shippingFee,
      discountAmount,
      payAmount,
      remark: remark || null,
      payType: payType || 0,
    };

    // 如果有地址，设置地址信息
    if (address) {
      orderData.addressId = address.id;
      orderData.receiverName = address.receiverName;
      orderData.receiverPhone = address.receiverPhone;
      orderData.receiverAddress = `${address.province}${address.city}${address.district}${address.detailAddress}`;
    }
    // 如果没有地址，不设置地址相关字段（使用 null，需要先执行数据库迁移脚本）

    const order = this.orderRepository.create(orderData);
    const savedOrder = await this.orderRepository.save(order);

    // 创建订单详情
    for (const item of orderItems) {
      const orderItem = this.orderItemRepository.create({
        orderId: savedOrder.id,
        ...item,
      });
      await this.orderItemRepository.save(orderItem);

      // 减少库存
      const sku = await this.productSkuRepository.findOne({
        where: { id: item.skuId },
      });
      if (sku) {
        sku.stock -= item.quantity;
        sku.sales += item.quantity;
        await this.productSkuRepository.save(sku);
      }
    }

    // 如果从购物车下单，删除购物车项
    if (cartItemIds && cartItemIds.length > 0) {
      await this.cartItemRepository.delete({ id: In(cartItemIds), userId });
    }

    return savedOrder;
  }

  /**
   * 获取订单列表
   */
  async findAll(userId: number, status?: number) {
    const where: any = { userId };
    if (status !== undefined) {
      where.status = status;
    }

    const orders = await this.orderRepository.find({
      where,
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });

    return orders;
  }

  /**
   * 获取订单详情
   */
  async findOne(userId: number, id: number) {
    const order = await this.orderRepository.findOne({
      where: { id, userId },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    return order;
  }

  /**
   * 取消订单
   */
  async cancel(userId: number, id: number) {
    const order = await this.orderRepository.findOne({
      where: { id, userId },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== 0) {
      throw new BadRequestException('只能取消待付款订单');
    }

    order.status = 4; // 已取消
    await this.orderRepository.save(order);

    // 恢复库存
    for (const item of order.items) {
      const sku = await this.productSkuRepository.findOne({
        where: { id: item.skuId },
      });
      if (sku) {
        sku.stock += item.quantity;
        sku.sales -= item.quantity;
        await this.productSkuRepository.save(sku);
      }
    }

    return order;
  }

  /**
   * 确认收货
   */
  async confirm(userId: number, id: number) {
    const order = await this.orderRepository.findOne({
      where: { id, userId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== 2) {
      throw new BadRequestException('订单状态不正确');
    }

    order.status = 3; // 已完成
    order.confirmTime = new Date();
    await this.orderRepository.save(order);

    return order;
  }
}

