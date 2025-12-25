import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from '../../common/entities/mall/banner.entity';

@Injectable()
export class MiniappBannerService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
  ) {}

  /**
   * 获取轮播图列表
   */
  async findAll() {
    return await this.bannerRepository.find({
      where: { status: 1 },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }
}

