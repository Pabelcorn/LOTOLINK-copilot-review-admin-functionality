import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Play, PlayPayment } from '../../domain/entities/play.entity';
import { Banca } from '../../domain/entities/banca.entity';
import { Sucursal } from '../../domain/entities/sucursal.entity';
import { PlayRepository, PLAY_REPOSITORY } from '../../domain/repositories/play.repository';
import { BancaRepository, BANCA_REPOSITORY } from '../../domain/repositories/banca.repository';
import { SucursalRepository, SUCURSAL_REPOSITORY } from '../../domain/repositories/sucursal.repository';
import { PlayStatus } from '../../domain/value-objects';
import { CreatePlayDto, PlayResponseDto, GetPlayDto } from '../dtos/play.dto';
import { EventPublisher, EVENT_PUBLISHER } from '../../ports/outgoing/event-publisher.port';
import { PlayCreatedEvent, PlayConfirmedEvent, PlayRejectedEvent } from '../../domain/events';

@Injectable()
export class PlayService {
  constructor(
    @Inject(PLAY_REPOSITORY)
    private readonly playRepository: PlayRepository,
    @Inject(BANCA_REPOSITORY)
    private readonly bancaRepository: BancaRepository,
    @Inject(SUCURSAL_REPOSITORY)
    private readonly sucursalRepository: SucursalRepository,
    @Inject(EVENT_PUBLISHER)
    private readonly eventPublisher: EventPublisher,
  ) {}

  async createPlay(dto: CreatePlayDto): Promise<PlayResponseDto> {
    // Check for idempotency
    const existingPlay = await this.playRepository.findByRequestId(dto.requestId);
    if (existingPlay) {
      return this.toPlayResponse(existingPlay);
    }

    const payment: PlayPayment = {
      method: dto.payment.method,
      walletTransactionId: dto.payment.walletTransactionId,
      cardLast4: dto.payment.cardLast4,
    };

    const play = new Play({
      requestId: dto.requestId,
      userId: dto.userId,
      lotteryId: dto.lotteryId,
      numbers: dto.numbers,
      betType: dto.betType,
      amount: dto.amount,
      currency: dto.currency,
      payment,
      bancaId: dto.bancaId,
    });

    const savedPlay = await this.playRepository.save(play);

    // Publish event for async processing
    await this.eventPublisher.publish(
      new PlayCreatedEvent(
        savedPlay.id,
        savedPlay.requestId,
        savedPlay.userId,
        savedPlay.lotteryId,
        savedPlay.amount,
      ),
    );

    return this.toPlayResponse(savedPlay);
  }

  async getPlayById(playId: string): Promise<GetPlayDto> {
    const play = await this.playRepository.findById(playId);
    if (!play) {
      throw new NotFoundException(`Play with id ${playId} not found`);
    }
    
    const { sucursalData, bancaData } = await this.getPlayRelations(play);
    return this.toGetPlayDtoWithRelations(play, sucursalData, bancaData);
  }

  async getPlaysByUserId(userId: string, limit = 20, offset = 0): Promise<GetPlayDto[]> {
    const plays = await this.playRepository.findByUserId(userId, limit, offset);
    
    const playsWithRelations = await Promise.all(
      plays.map(async (play) => {
        const { sucursalData, bancaData } = await this.getPlayRelations(play);
        return this.toGetPlayDtoWithRelations(play, sucursalData, bancaData);
      })
    );
    
    return playsWithRelations;
  }

  async confirmPlay(playId: string, playIdBanca: string, ticketCode: string): Promise<void> {
    const play = await this.playRepository.findById(playId);
    if (!play) {
      throw new NotFoundException(`Play with id ${playId} not found`);
    }

    play.confirm(playIdBanca, ticketCode);
    await this.playRepository.update(play);

    await this.eventPublisher.publish(
      new PlayConfirmedEvent(play.id, playIdBanca, ticketCode),
    );
  }

  async confirmPlayByRequestId(requestId: string, playIdBanca: string, ticketCode: string): Promise<void> {
    const play = await this.playRepository.findByRequestId(requestId);
    if (!play) {
      throw new NotFoundException(`Play with requestId ${requestId} not found`);
    }

    play.confirm(playIdBanca, ticketCode);
    await this.playRepository.update(play);

    await this.eventPublisher.publish(
      new PlayConfirmedEvent(play.id, playIdBanca, ticketCode),
    );
  }

  async rejectPlay(playId: string, reason?: string): Promise<void> {
    const play = await this.playRepository.findById(playId);
    if (!play) {
      throw new NotFoundException(`Play with id ${playId} not found`);
    }

    play.reject(reason);
    await this.playRepository.update(play);

    await this.eventPublisher.publish(
      new PlayRejectedEvent(play.id, reason),
    );
  }

  async rejectPlayByRequestId(requestId: string, reason?: string): Promise<void> {
    const play = await this.playRepository.findByRequestId(requestId);
    if (!play) {
      throw new NotFoundException(`Play with requestId ${requestId} not found`);
    }

    play.reject(reason);
    await this.playRepository.update(play);

    await this.eventPublisher.publish(
      new PlayRejectedEvent(play.id, reason),
    );
  }

  async assignSucursal(playId: string, sucursalId: string): Promise<void> {
    const play = await this.playRepository.findById(playId);
    if (!play) {
      throw new NotFoundException(`Play with id ${playId} not found`);
    }
    
    play.assignSucursal(sucursalId);
    await this.playRepository.update(play);
  }

  async getPlayByRequestId(requestId: string): Promise<Play | null> {
    return await this.playRepository.findByRequestId(requestId);
  }

  private toPlayResponse(play: Play): PlayResponseDto {
    const estimatedMs = 30000; // 30 seconds estimation
    const estimatedConfirmation = new Date(Date.now() + estimatedMs).toISOString();

    return {
      playId: play.id,
      status: play.status,
      estimatedConfirmation: play.status === PlayStatus.PENDING ? estimatedConfirmation : undefined,
      ticketCode: play.ticketCode,
      createdAt: play.createdAt,
    };
  }

  private async getPlayRelations(play: Play): Promise<{
    sucursalData: Sucursal | null;
    bancaData: Banca | null;
  }> {
    let sucursalData = null;
    let bancaData = null;

    if (play.sucursalId) {
      sucursalData = await this.sucursalRepository.findById(play.sucursalId);
      if (sucursalData) {
        bancaData = await this.bancaRepository.findById(sucursalData.bancaId);
      }
    } else if (play.bancaId) {
      bancaData = await this.bancaRepository.findById(play.bancaId);
    }

    return { sucursalData, bancaData };
  }

  private toGetPlayDtoWithRelations(
    play: Play,
    sucursal: Sucursal | null,
    banca: Banca | null
  ): GetPlayDto {
    const dto: GetPlayDto = {
      playId: play.id,
      requestId: play.requestId,
      userId: play.userId,
      lotteryId: play.lotteryId,
      numbers: play.numbers,
      betType: play.betType,
      amount: play.amount,
      currency: play.currency,
      status: play.status,
      playIdBanca: play.playIdBanca,
      ticketCode: play.ticketCode,
      bancaId: play.bancaId,
      sucursalId: play.sucursalId,
      sorteoNumber: play.sorteoNumber,
      sorteoTime: play.sorteoTime,
      sorteoName: play.sorteoName,
      barcode: play.barcode,
      validUntil: play.validUntil,
      operatorUserId: play.operatorUserId,
      modality: play.modality,
      receiptPrintedAt: play.receiptPrintedAt,
      createdAt: play.createdAt,
      updatedAt: play.updatedAt,
    };

    // Add sucursal data if exists
    if (sucursal) {
      dto.sucursalName = sucursal.name;
      dto.sucursalCode = sucursal.code;
      dto.sucursalAddress = sucursal.address;
      dto.sucursalCity = sucursal.city;
      dto.sucursalProvince = sucursal.province;
      dto.sucursalPhone = sucursal.phone;
      dto.sucursalOperatorPrefix = sucursal.operatorPrefix;
      dto.ticketConfig = sucursal.ticketConfig;
    }

    // Add banca data if exists
    if (banca) {
      dto.bancaName = banca.name;
      dto.bancaEmail = banca.email;
      dto.bancaPhone = banca.phone;
      dto.bancaAddress = banca.address;
      // dto.bancaLogo = banca.logo; // If the field exists in future
    }

    return dto;
  }
}
