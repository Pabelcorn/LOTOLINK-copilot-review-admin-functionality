import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prize, PrizeStatus, BankAccountInfo, PaymentMethod } from '../../../domain/entities/prize.entity';
import { PrizeRepository } from '../../../domain/repositories/prize.repository';
import { PrizeEntity } from '../entities/prize.db-entity';

@Injectable()
export class TypeOrmPrizeRepository implements PrizeRepository {
  constructor(
    @InjectRepository(PrizeEntity)
    private readonly prizeRepository: Repository<PrizeEntity>,
  ) {}

  async save(prize: Prize): Promise<Prize> {
    const entity = this.toEntity(prize);
    const saved = await this.prizeRepository.save(entity);
    return this.toDomain(saved);
  }

  async update(prize: Prize): Promise<Prize> {
    const entity = this.toEntity(prize);
    await this.prizeRepository.save(entity);
    return prize;
  }

  async findById(id: string): Promise<Prize | null> {
    const entity = await this.prizeRepository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByPlayId(playId: string): Promise<Prize | null> {
    const entity = await this.prizeRepository.findOne({ where: { playId } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByUserId(userId: string, limit = 20, offset = 0): Promise<Prize[]> {
    const entities = await this.prizeRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findByStatus(status: PrizeStatus, limit = 20, offset = 0): Promise<Prize[]> {
    const entities = await this.prizeRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findPendingPrizes(limit = 20, offset = 0): Promise<Prize[]> {
    const entities = await this.prizeRepository.find({
      where: [
        { status: PrizeStatus.PENDING },
        { status: PrizeStatus.CLAIMED },
        { status: PrizeStatus.VERIFYING },
      ],
      order: { createdAt: 'ASC' },
      take: limit,
      skip: offset,
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findByBancaId(bancaId: string, limit = 20, offset = 0): Promise<Prize[]> {
    const entities = await this.prizeRepository.find({
      where: { bancaId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async countByStatus(status: PrizeStatus): Promise<number> {
    return this.prizeRepository.count({ where: { status } });
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prizeRepository.count({ where: { userId } });
  }

  private toEntity(prize: Prize): PrizeEntity {
    const json = prize.toJSON();
    const entity = new PrizeEntity();
    
    entity.id = json.id;
    entity.playId = json.playId;
    entity.bancaId = json.bancaId;
    entity.userId = json.userId;
    entity.lotteryId = json.lotteryId;
    entity.lotteryDrawId = json.lotteryDrawId;
    entity.drawDate = json.drawDate;
    entity.betTypeId = json.betTypeId;
    entity.winningNumbers = json.winningNumbers;
    entity.matchedNumbers = json.matchedNumbers;
    entity.betAmount = json.betAmount;
    entity.prizeMultiplier = json.prizeMultiplier;
    entity.prizeAmount = json.prizeAmount;
    entity.status = json.status;
    entity.paidAt = json.paidAt;
    entity.paidBy = json.paidBy;
    entity.verifiedAt = json.verifiedAt;
    entity.verifiedBy = json.verifiedBy;
    entity.verificationNotes = json.verificationNotes;
    entity.createdAt = json.createdAt;
    entity.updatedAt = json.updatedAt;
    
    return entity;
  }

  private toDomain(entity: PrizeEntity): Prize {
    return new Prize({
      id: entity.id,
      playId: entity.playId,
      bancaId: entity.bancaId,
      userId: entity.userId,
      lotteryId: entity.lotteryId,
      lotteryDrawId: entity.lotteryDrawId,
      drawDate: entity.drawDate,
      betTypeId: entity.betTypeId,
      winningNumbers: entity.winningNumbers,
      matchedNumbers: entity.matchedNumbers,
      betAmount: Number(entity.betAmount),
      prizeMultiplier: Number(entity.prizeMultiplier),
      prizeAmount: Number(entity.prizeAmount),
      status: entity.status as PrizeStatus,
      paidAt: entity.paidAt,
      paidBy: entity.paidBy,
      verifiedAt: entity.verifiedAt,
      verifiedBy: entity.verifiedBy,
      verificationNotes: entity.verificationNotes,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
