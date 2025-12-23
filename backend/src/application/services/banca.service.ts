import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BancaRepository, BANCA_REPOSITORY } from '../../domain/repositories/banca.repository';
import { Banca, BancaStatus, IntegrationType, AuthType } from '../../domain/entities/banca.entity';
import { CreateBancaDto, UpdateBancaDto, BancaResponseDto, BancaCredentialsDto } from '../dtos/banca.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class BancaService {
  constructor(
    @Inject(BANCA_REPOSITORY)
    private readonly bancaRepository: BancaRepository,
    private readonly configService: ConfigService,
  ) {}

  async createBanca(dto: CreateBancaDto): Promise<BancaResponseDto> {
    // Check if banca with same name or email already exists
    const existingByName = await this.bancaRepository.findByName(dto.name);
    if (existingByName) {
      throw new ConflictException(`Banca with name ${dto.name} already exists`);
    }

    const existingByEmail = await this.bancaRepository.findByEmail(dto.email);
    if (existingByEmail) {
      throw new ConflictException(`Banca with email ${dto.email} already exists`);
    }

    const banca = new Banca({
      name: dto.name,
      integrationType: dto.integrationType,
      authType: dto.authType || AuthType.HMAC,
      rnc: dto.rnc,
      address: dto.address,
      phone: dto.phone,
      email: dto.email,
      endpoint: dto.endpoint,
      status: BancaStatus.PENDING,
      isActive: false,
    });

    const saved = await this.bancaRepository.save(banca);
    return this.toBancaResponseDto(saved);
  }

  async getAllBancas(activeOnly?: boolean): Promise<BancaResponseDto[]> {
    const bancas = await this.bancaRepository.findAll(activeOnly);
    return bancas.map(banca => this.toBancaResponseDto(banca));
  }

  async getBancasByStatus(status: BancaStatus): Promise<BancaResponseDto[]> {
    const bancas = await this.bancaRepository.findByStatus(status);
    return bancas.map(banca => this.toBancaResponseDto(banca));
  }

  async getBancaById(id: string): Promise<BancaResponseDto> {
    const banca = await this.bancaRepository.findById(id);
    if (!banca) {
      throw new NotFoundException(`Banca with id ${id} not found`);
    }
    return this.toBancaResponseDto(banca);
  }

  async updateBanca(id: string, dto: UpdateBancaDto): Promise<BancaResponseDto> {
    const banca = await this.bancaRepository.findById(id);
    if (!banca) {
      throw new NotFoundException(`Banca with id ${id} not found`);
    }

    // Update contact info if provided
    if (dto.rnc || dto.address || dto.phone || dto.email) {
      banca.updateContactInfo(dto.rnc, dto.address, dto.phone, dto.email);
    }

    // Update endpoint if provided
    if (dto.endpoint) {
      banca.updateEndpoint(dto.endpoint);
    }

    // Update bank account settings if provided
    if (dto.commissionPercentage !== undefined || dto.commissionStripeAccountId !== undefined || dto.cardProcessingAccountId !== undefined) {
      banca.updateBankAccountSettings(
        dto.commissionPercentage,
        dto.commissionStripeAccountId,
        dto.cardProcessingAccountId
      );
    }

    const updated = await this.bancaRepository.update(banca);
    return this.toBancaResponseDto(updated);
  }

  async approveBanca(bancaId: string, endpoint?: string): Promise<{ banca: BancaResponseDto; credentials: BancaCredentialsDto }> {
    const banca = await this.bancaRepository.findById(bancaId);
    if (!banca) {
      throw new NotFoundException(`Banca with id ${bancaId} not found`);
    }

    if (banca.status !== BancaStatus.PENDING) {
      throw new ConflictException(`Banca is not in pending status`);
    }

    // Generate credentials
    const credentials = this.generateCredentials();

    // Update banca with credentials and endpoint
    banca.updateCredentials(credentials.clientId, credentials.clientSecret, credentials.hmacSecret);
    if (endpoint) {
      banca.updateEndpoint(endpoint);
    }
    banca.approve();
    banca.activateAfterApproval();

    const updated = await this.bancaRepository.update(banca);

    return {
      banca: this.toBancaResponseDto(updated),
      credentials: {
        clientId: credentials.clientId,
        clientSecret: credentials.clientSecret,
        hmacSecret: credentials.hmacSecret,
      },
    };
  }

  async rejectBanca(bancaId: string): Promise<BancaResponseDto> {
    const banca = await this.bancaRepository.findById(bancaId);
    if (!banca) {
      throw new NotFoundException(`Banca with id ${bancaId} not found`);
    }

    if (banca.status !== BancaStatus.PENDING) {
      throw new ConflictException(`Banca is not in pending status`);
    }

    banca.reject();
    const updated = await this.bancaRepository.update(banca);
    return this.toBancaResponseDto(updated);
  }

  async suspendBanca(bancaId: string): Promise<BancaResponseDto> {
    const banca = await this.bancaRepository.findById(bancaId);
    if (!banca) {
      throw new NotFoundException(`Banca with id ${bancaId} not found`);
    }

    banca.suspend();
    const updated = await this.bancaRepository.update(banca);
    return this.toBancaResponseDto(updated);
  }

  async activateBanca(bancaId: string): Promise<BancaResponseDto> {
    const banca = await this.bancaRepository.findById(bancaId);
    if (!banca) {
      throw new NotFoundException(`Banca with id ${bancaId} not found`);
    }

    banca.activate();
    const updated = await this.bancaRepository.update(banca);
    return this.toBancaResponseDto(updated);
  }

  private generateCredentials(): { clientId: string; clientSecret: string; hmacSecret: string } {
    return {
      clientId: `client_${randomBytes(16).toString('hex')}`,
      clientSecret: randomBytes(32).toString('base64'),
      hmacSecret: randomBytes(32).toString('base64'),
    };
  }

  private toBancaResponseDto(banca: Banca): BancaResponseDto {
    return {
      id: banca.id,
      name: banca.name,
      integrationType: banca.integrationType,
      authType: banca.authType,
      endpoint: banca.endpoint,
      rnc: banca.rnc,
      address: banca.address,
      phone: banca.phone,
      email: banca.email,
      status: banca.status,
      isActive: banca.isActive,
      clientId: banca.clientId,
      commissionPercentage: banca.commissionPercentage,
      commissionStripeAccountId: banca.commissionStripeAccountId,
      cardProcessingAccountId: banca.cardProcessingAccountId,
      createdAt: banca.createdAt,
      updatedAt: banca.updatedAt,
    };
  }
}
