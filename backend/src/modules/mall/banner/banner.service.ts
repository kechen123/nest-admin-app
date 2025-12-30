import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Banner } from '../../../common/entities/mall/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { QueryBannerDto } from './dto/query-banner.dto';
import { IPaginationResponse } from '../../../common/interfaces/response.interface';
import { OperationLogService } from '../../operation-log/operation-log.service';
import { Request } from 'express';

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
    private readonly operationLogService: OperationLogService,
  ) {}

  /**
   * 创建轮播图
   */
  async create(createBannerDto: CreateBannerDto, req?: Request): Promise<Banner> {
    const banner = this.bannerRepository.create({
      ...createBannerDto,
      linkType: createBannerDto.linkType || 0,
      sortOrder: createBannerDto.sortOrder || 0,
      status: createBannerDto.status !== undefined ? createBannerDto.status : 1,
    });

    const saved = await this.bannerRepository.save(banner);

    // 记录操作日志
    if (req) {
      await this.operationLogService.create({
        title: '轮播图管理',
        businessType: '新增',
        method: 'create',
        requestMethod: 'POST',
        operatorType: 1,
        userId: (req as any).user?.userId,
        username: (req as any).user?.username,
        operUrl: req.url,
        operIp: req.ip,
        operParam: JSON.stringify(createBannerDto),
        status: 1,
      });
    }

    return saved;
  }

  /**
   * 分页查询轮播图
   */
  async findAll(queryDto: QueryBannerDto): Promise<IPaginationResponse<Banner>> {
    const { page = 1, pageSize = 10, title, status, linkType } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.bannerRepository.createQueryBuilder('banner')
      .where('banner.deletedAt IS NULL');

    if (title) {
      queryBuilder.andWhere('banner.title LIKE :title', { title: `%${title}%` });
    }
    if (status !== undefined) {
      queryBuilder.andWhere('banner.status = :status', { status });
    }
    if (linkType !== undefined) {
      queryBuilder.andWhere('banner.linkType = :linkType', { linkType });
    }

    queryBuilder
      .orderBy('banner.sortOrder', 'ASC')
      .addOrderBy('banner.createdAt', 'DESC')
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
   * 根据ID查询轮播图
   */
  async findOne(id: number): Promise<Banner> {
    const banner = await this.bannerRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!banner) {
      throw new NotFoundException(`轮播图 ID ${id} 不存在`);
    }
    return banner;
  }

  /**
   * 更新轮播图
   */
  async update(id: number, updateBannerDto: UpdateBannerDto, req?: Request): Promise<Banner> {
    const banner = await this.findOne(id);

    Object.assign(banner, updateBannerDto);
    const saved = await this.bannerRepository.save(banner);

    // 记录操作日志
    if (req) {
      await this.operationLogService.create({
        title: '轮播图管理',
        businessType: '修改',
        method: 'update',
        requestMethod: 'PATCH',
        operatorType: 1,
        userId: (req as any).user?.userId,
        username: (req as any).user?.username,
        operUrl: req.url,
        operIp: req.ip,
        operParam: JSON.stringify(updateBannerDto),
        status: 1,
      });
    }

    return saved;
  }

  /**
   * 删除轮播图（软删除）
   */
  async remove(id: number, req?: Request): Promise<void> {
    const banner = await this.findOne(id);

    await this.bannerRepository.softRemove(banner);

    // 记录操作日志
    if (req) {
      await this.operationLogService.create({
        title: '轮播图管理',
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

