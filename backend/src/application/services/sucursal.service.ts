import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { SUCURSAL_REPOSITORY, SucursalRepository } from '../../domain/repositories/sucursal.repository';
import { BANCA_REPOSITORY, BancaRepository } from '../../domain/repositories/banca.repository';
import { Sucursal, TicketConfig } from '../../domain/entities/sucursal.entity';
import {
  CreateSucursalDto,
  UpdateSucursalDto,
  SucursalResponseDto,
  UpdateTicketConfigDto,
} from '../dtos/sucursal.dto';

@Injectable()
export class SucursalService {
  constructor(
    @Inject(SUCURSAL_REPOSITORY)
    private readonly sucursalRepository: SucursalRepository,
    @Inject(BANCA_REPOSITORY)
    private readonly bancaRepository: BancaRepository,
  ) {}

  async createSucursal(bancaId: string, dto: CreateSucursalDto): Promise<SucursalResponseDto> {
    // Verify banca exists
    const banca = await this.bancaRepository.findById(bancaId);
    if (!banca) {
      throw new NotFoundException(`Banca with id ${bancaId} not found`);
    }

    // Check if code is unique within the banca
    const existing = await this.sucursalRepository.findByBancaIdAndCode(bancaId, dto.code);
    if (existing) {
      throw new ConflictException(`Sucursal with code ${dto.code} already exists for this banca`);
    }

    const sucursal = new Sucursal({
      bancaId,
      name: dto.name,
      code: dto.code,
      address: dto.address,
      city: dto.city,
      province: dto.province,
      phone: dto.phone,
      operatorPrefix: dto.operatorPrefix,
      isActive: dto.isActive,
      ticketConfig: dto.ticketConfig as TicketConfig,
    });

    const saved = await this.sucursalRepository.save(sucursal);
    return this.toResponseDto(saved);
  }

  async getSucursalesByBanca(bancaId: string): Promise<SucursalResponseDto[]> {
    const sucursales = await this.sucursalRepository.findByBancaId(bancaId);
    return sucursales.map(s => this.toResponseDto(s));
  }

  async getSucursalById(id: string): Promise<SucursalResponseDto> {
    const sucursal = await this.sucursalRepository.findById(id);
    if (!sucursal) {
      throw new NotFoundException(`Sucursal with id ${id} not found`);
    }
    return this.toResponseDto(sucursal);
  }

  async updateSucursal(id: string, dto: UpdateSucursalDto): Promise<SucursalResponseDto> {
    const sucursal = await this.sucursalRepository.findById(id);
    if (!sucursal) {
      throw new NotFoundException(`Sucursal with id ${id} not found`);
    }

    if (dto.address || dto.city || dto.province || dto.phone) {
      sucursal.updateContactInfo(dto.address, dto.city, dto.province, dto.phone);
    }

    if (dto.isActive !== undefined) {
      if (dto.isActive) {
        sucursal.activate();
      } else {
        sucursal.deactivate();
      }
    }

    const updated = await this.sucursalRepository.update(sucursal);
    return this.toResponseDto(updated);
  }

  async updateTicketConfig(id: string, config: UpdateTicketConfigDto): Promise<SucursalResponseDto> {
    const sucursal = await this.sucursalRepository.findById(id);
    if (!sucursal) {
      throw new NotFoundException(`Sucursal with id ${id} not found`);
    }

    sucursal.updateTicketConfig(config);
    const updated = await this.sucursalRepository.update(sucursal);
    return this.toResponseDto(updated);
  }

  async activateSucursal(id: string): Promise<SucursalResponseDto> {
    const sucursal = await this.sucursalRepository.findById(id);
    if (!sucursal) {
      throw new NotFoundException(`Sucursal with id ${id} not found`);
    }

    sucursal.activate();
    const updated = await this.sucursalRepository.update(sucursal);
    return this.toResponseDto(updated);
  }

  async deactivateSucursal(id: string): Promise<void> {
    const sucursal = await this.sucursalRepository.findById(id);
    if (!sucursal) {
      throw new NotFoundException(`Sucursal with id ${id} not found`);
    }

    sucursal.deactivate();
    await this.sucursalRepository.update(sucursal);
  }

  private toResponseDto(sucursal: Sucursal): SucursalResponseDto {
    const json = sucursal.toJSON();
    return {
      id: json.id,
      bancaId: json.bancaId,
      name: json.name,
      code: json.code,
      address: json.address,
      city: json.city,
      province: json.province,
      phone: json.phone,
      operatorPrefix: json.operatorPrefix,
      isActive: json.isActive,
      ticketConfig: json.ticketConfig,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt,
    };
  }
}
