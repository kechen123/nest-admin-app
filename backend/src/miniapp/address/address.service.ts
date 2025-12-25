import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../../common/entities/mall/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class MiniappAddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  /**
   * 获取地址列表
   */
  async findAll(userId: number) {
    return await this.addressRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * 获取地址详情
   */
  async findOne(userId: number, id: number) {
    const address = await this.addressRepository.findOne({
      where: { id, userId },
    });

    if (!address) {
      throw new NotFoundException('地址不存在');
    }

    return address;
  }

  /**
   * 创建地址
   */
  async create(userId: number, createAddressDto: CreateAddressDto) {
    // 如果设置为默认地址，先取消其他默认地址
    if (createAddressDto.isDefault === 1) {
      await this.addressRepository.update(
        { userId, isDefault: 1 },
        { isDefault: 0 },
      );
    }

    const address = this.addressRepository.create({
      ...createAddressDto,
      userId,
    });

    return await this.addressRepository.save(address);
  }

  /**
   * 更新地址
   */
  async update(userId: number, id: number, updateData: Partial<CreateAddressDto>) {
    const address = await this.addressRepository.findOne({
      where: { id, userId },
    });

    if (!address) {
      throw new NotFoundException('地址不存在');
    }

    // 如果设置为默认地址，先取消其他默认地址
    if (updateData.isDefault === 1) {
      await this.addressRepository.update(
        { userId, isDefault: 1 },
        { isDefault: 0 },
      );
    }

    Object.assign(address, updateData);
    return await this.addressRepository.save(address);
  }

  /**
   * 删除地址
   */
  async remove(userId: number, id: number) {
    const address = await this.addressRepository.findOne({
      where: { id, userId },
    });

    if (!address) {
      throw new NotFoundException('地址不存在');
    }

    await this.addressRepository.remove(address);
    return { message: '删除成功' };
  }

  /**
   * 设置默认地址
   */
  async setDefault(userId: number, id: number) {
    // 先取消所有默认地址
    await this.addressRepository.update(
      { userId, isDefault: 1 },
      { isDefault: 0 },
    );

    // 设置新的默认地址
    const address = await this.addressRepository.findOne({
      where: { id, userId },
    });

    if (!address) {
      throw new NotFoundException('地址不存在');
    }

    address.isDefault = 1;
    return await this.addressRepository.save(address);
  }
}

