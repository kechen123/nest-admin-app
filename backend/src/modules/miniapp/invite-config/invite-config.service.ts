import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InviteConfig } from './invite-config.entity';
import { CreateInviteConfigDto } from './dto/create-invite-config.dto';
import { UpdateInviteConfigDto } from './dto/update-invite-config.dto';
import { QueryInviteConfigDto } from './dto/query-invite-config.dto';
import { IPaginationResponse } from '../../../common/interfaces/response.interface';

@Injectable()
export class InviteConfigService {
  constructor(
    @InjectRepository(InviteConfig)
    private readonly inviteConfigRepository: Repository<InviteConfig>,
  ) {}

  /**
   * 创建邀请配置
   */
  async create(createDto: CreateInviteConfigDto): Promise<InviteConfig> {
    const inviteConfig = this.inviteConfigRepository.create({
      ...createDto,
      isEnabled: 0, // 创建时默认为未启用
      sortOrder: createDto.sortOrder || 0,
    });

    return await this.inviteConfigRepository.save(inviteConfig);
  }

  /**
   * 分页查询邀请配置
   */
  async findAll(queryDto: QueryInviteConfigDto): Promise<IPaginationResponse<InviteConfig>> {
    const { page = 1, pageSize = 10, isEnabled } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.inviteConfigRepository.createQueryBuilder('config');

    if (isEnabled !== undefined) {
      queryBuilder.where('config.isEnabled = :isEnabled', { isEnabled });
    }

    queryBuilder.orderBy('config.sortOrder', 'ASC').addOrderBy('config.createdAt', 'DESC');

    const [data, total] = await queryBuilder.skip(skip).take(pageSize).getManyAndCount();

    return {
      list: data,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 根据ID查询邀请配置
   */
  async findOne(id: number): Promise<InviteConfig> {
    const config = await this.inviteConfigRepository.findOne({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException('邀请配置不存在');
    }

    return config;
  }

  /**
   * 获取启用的邀请配置（只能有一个）
   */
  async findEnabled(): Promise<InviteConfig | null> {
    return await this.inviteConfigRepository.findOne({
      where: { isEnabled: 1 },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * 更新邀请配置
   */
  async update(id: number, updateDto: UpdateInviteConfigDto): Promise<InviteConfig> {
    const config = await this.findOne(id);

    Object.assign(config, updateDto);

    return await this.inviteConfigRepository.save(config);
  }

  /**
   * 删除邀请配置
   */
  async remove(id: number): Promise<void> {
    const config = await this.findOne(id);

    // 如果删除的是启用的配置，需要先禁用
    if (config.isEnabled === 1) {
      throw new BadRequestException('不能删除已启用的配置，请先禁用');
    }

    await this.inviteConfigRepository.remove(config);
  }

  /**
   * 启用/禁用邀请配置
   * 启用时，会自动禁用其他已启用的配置（确保只能有一个启用）
   */
  async toggleEnabled(id: number, isEnabled: number): Promise<InviteConfig> {
    const config = await this.findOne(id);

    if (isEnabled === 1) {
      // 启用时，先禁用其他所有已启用的配置
      await this.inviteConfigRepository.update(
        { isEnabled: 1 },
        { isEnabled: 0 },
      );
    }

    config.isEnabled = isEnabled;
    return await this.inviteConfigRepository.save(config);
  }
}
