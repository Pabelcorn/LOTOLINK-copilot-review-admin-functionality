import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BancaRepository } from '../../../domain/repositories/banca.repository';
import { Banca, BancaStatus, IntegrationType, AuthType } from '../../../domain/entities/banca.entity';
import { BancaEntity } from '../entities/banca.db-entity';

@Injectable()
export class TypeOrmBancaRepository implements BancaRepository {
  constructor(
    @InjectRepository(BancaEntity)
    private readonly bancaRepository: Repository<BancaEntity>,
  ) {}

  async save(banca: Banca): Promise<Banca> {
    const entity = this.toEntity(banca);
    const saved = await this.bancaRepository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Banca | null> {
    const entity = await this.bancaRepository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByName(name: string): Promise<Banca | null> {
    const entity = await this.bancaRepository.findOne({ where: { name } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(activeOnly?: boolean): Promise<Banca[]> {
    const queryBuilder = this.bancaRepository.createQueryBuilder('banca');
    
    if (activeOnly) {
      queryBuilder.where('banca.is_active = :isActive', { isActive: true });
    }
    
    const entities = await queryBuilder.getMany();
    return entities.map(entity => this.toDomain(entity));
  }

  async findByStatus(status: BancaStatus): Promise<Banca[]> {
    const entities = await this.bancaRepository.find({ where: { status } });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByEmail(email: string): Promise<Banca | null> {
    const entity = await this.bancaRepository.findOne({ where: { email } });
    return entity ? this.toDomain(entity) : null;
  }

  async update(banca: Banca): Promise<Banca> {
    const entity = this.toEntity(banca);
    await this.bancaRepository.update(banca.id, entity);
    const updated = await this.bancaRepository.findOne({ where: { id: banca.id } });
    if (!updated) {
      throw new Error(`Banca with id ${banca.id} not found`);
    }
    return this.toDomain(updated);
  }

  private toDomain(entity: BancaEntity): Banca {
    return new Banca({
      id: entity.id,
      name: entity.name,
      integrationType: entity.integrationType as IntegrationType,
      endpoint: entity.endpoint,
      authType: entity.authType as AuthType,
      clientId: entity.clientId,
      secret: entity.secret,
      publicKey: entity.publicKey,
      slaMs: entity.slaMs,
      isActive: entity.isActive,
      rnc: entity.rnc,
      address: entity.address,
      phone: entity.phone,
      email: entity.email,
      status: entity.status as BancaStatus,
      commissionPercentage: entity.commissionPercentage,
      commissionStripeAccountId: entity.commissionStripeAccountId,
      cardProcessingAccountId: entity.cardProcessingAccountId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private toEntity(banca: Banca): Partial<BancaEntity> {
    return {
      id: banca.id,
      name: banca.name,
      integrationType: banca.integrationType,
      endpoint: banca.endpoint,
      authType: banca.authType,
      clientId: banca.clientId,
      secret: banca.secret,
      publicKey: banca.publicKey,
      slaMs: banca.slaMs,
      isActive: banca.isActive,
      rnc: banca.rnc,
      address: banca.address,
      phone: banca.phone,
      email: banca.email,
      status: banca.status,
      commissionPercentage: banca.commissionPercentage,
      commissionStripeAccountId: banca.commissionStripeAccountId,
      cardProcessingAccountId: banca.cardProcessingAccountId,
    };
  }
}
