import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SucursalRepository } from '../../../domain/repositories/sucursal.repository';
import { Sucursal, TicketConfig } from '../../../domain/entities/sucursal.entity';
import { SucursalEntity } from '../entities/sucursal.db-entity';

@Injectable()
export class TypeOrmSucursalRepository implements SucursalRepository {
  constructor(
    @InjectRepository(SucursalEntity)
    private readonly sucursalRepository: Repository<SucursalEntity>,
  ) {}

  async save(sucursal: Sucursal): Promise<Sucursal> {
    const entity = this.toEntity(sucursal);
    const saved = await this.sucursalRepository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Sucursal | null> {
    const entity = await this.sucursalRepository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByBancaId(bancaId: string): Promise<Sucursal[]> {
    const entities = await this.sucursalRepository.find({ 
      where: { bancaId },
      order: { name: 'ASC' }
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByBancaIdAndCode(bancaId: string, code: string): Promise<Sucursal | null> {
    const entity = await this.sucursalRepository.findOne({ 
      where: { bancaId, code } 
    });
    return entity ? this.toDomain(entity) : null;
  }

  async update(sucursal: Sucursal): Promise<Sucursal> {
    const entity = this.toEntity(sucursal);
    await this.sucursalRepository.update(sucursal.id, entity);
    const updated = await this.sucursalRepository.findOne({ where: { id: sucursal.id } });
    if (!updated) {
      throw new Error(`Sucursal with id ${sucursal.id} not found`);
    }
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.sucursalRepository.delete(id);
  }

  private toDomain(entity: SucursalEntity): Sucursal {
    return new Sucursal({
      id: entity.id,
      bancaId: entity.bancaId,
      name: entity.name,
      code: entity.code,
      address: entity.address,
      city: entity.city,
      province: entity.province,
      phone: entity.phone,
      operatorPrefix: entity.operatorPrefix,
      isActive: entity.isActive,
      ticketConfig: entity.ticketConfig as TicketConfig,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private toEntity(sucursal: Sucursal): Partial<SucursalEntity> {
    return {
      id: sucursal.id,
      bancaId: sucursal.bancaId,
      name: sucursal.name,
      code: sucursal.code,
      address: sucursal.address,
      city: sucursal.city,
      province: sucursal.province,
      phone: sucursal.phone,
      operatorPrefix: sucursal.operatorPrefix,
      isActive: sucursal.isActive,
      ticketConfig: sucursal.ticketConfig,
    };
  }
}
