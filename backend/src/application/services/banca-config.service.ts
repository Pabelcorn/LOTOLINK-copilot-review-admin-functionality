import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BANCA_REPOSITORY, BancaRepository } from '../../domain/repositories/banca.repository';
import { BancaLotteryEntity } from '../../infrastructure/database/entities/banca-lottery.db-entity';
import { BancaDrawEntity } from '../../infrastructure/database/entities/banca-draw.db-entity';
import { BancaBetConfigurationEntity } from '../../infrastructure/database/entities/banca-bet-configuration.db-entity';
import { LotteryEntity } from '../../infrastructure/database/entities/lottery.db-entity';
import { LotteryDrawEntity } from '../../infrastructure/database/entities/lottery-draw.db-entity';
import { BetTypeEntity } from '../../infrastructure/database/entities/bet-type.db-entity';

export interface BancaLotteryDto {
  id: string;
  name: string;
  logo?: string;
  enabled: boolean;
  commission?: number;
  dailyLimit?: number;
  maxPerBet?: number;
}

export interface BancaDrawDto {
  id: string;
  name: string;
  time: string;
  days: string[];
  enabled: boolean;
  earlyCloseMinutes: number;
}

export interface BetTypeConfigDto {
  type: string;
  minAmount: number;
  maxAmount: number;
  increment: number;
  multiplier: number;
  maxPrize?: number;
}

export interface BancaBetConfigDto {
  betTypes: BetTypeConfigDto[];
  blockedNumbers: string[];
  numberLimits: Array<{
    number: string;
    dailyLimit: number;
    currentSales: number;
  }>;
}

@Injectable()
export class BancaConfigService {
  constructor(
    @Inject(BANCA_REPOSITORY)
    private readonly bancaRepository: BancaRepository,
    @InjectRepository(BancaLotteryEntity)
    private readonly bancaLotteryRepository: Repository<BancaLotteryEntity>,
    @InjectRepository(BancaDrawEntity)
    private readonly bancaDrawRepository: Repository<BancaDrawEntity>,
    @InjectRepository(BancaBetConfigurationEntity)
    private readonly betConfigRepository: Repository<BancaBetConfigurationEntity>,
    @InjectRepository(LotteryEntity)
    private readonly lotteryRepository: Repository<LotteryEntity>,
    @InjectRepository(LotteryDrawEntity)
    private readonly lotteryDrawRepository: Repository<LotteryDrawEntity>,
    @InjectRepository(BetTypeEntity)
    private readonly betTypeRepository: Repository<BetTypeEntity>,
  ) {}

  async getLotteriesForBanca(bancaId: string): Promise<{ lotteries: BancaLotteryDto[] }> {
    // Verify banca exists
    const banca = await this.bancaRepository.findById(bancaId);
    if (!banca) {
      throw new NotFoundException(`Banca with id ${bancaId} not found`);
    }

    // Get all enabled lotteries for this banca
    const bancaLotteries = await this.bancaLotteryRepository.find({
      where: { bancaId, isEnabled: true },
      relations: ['lottery'],
    });

    const lotteries: BancaLotteryDto[] = bancaLotteries.map(bl => ({
      id: bl.lotteryId,
      name: bl.lottery?.name || bl.lotteryId,
      logo: bl.lottery?.logoUrl,
      enabled: bl.isEnabled,
      commission: bl.commissionOverride ? Number(bl.commissionOverride) : undefined,
      dailyLimit: bl.dailyLimit ? Number(bl.dailyLimit) : undefined,
      maxPerBet: bl.perBetMax ? Number(bl.perBetMax) : undefined,
    }));

    return { lotteries };
  }

  async getDrawsForBanca(bancaId: string, lotteryId: string): Promise<{ draws: BancaDrawDto[] }> {
    // Verify banca exists
    const banca = await this.bancaRepository.findById(bancaId);
    if (!banca) {
      throw new NotFoundException(`Banca with id ${bancaId} not found`);
    }

    // Verify lottery is enabled for this banca
    const bancaLottery = await this.bancaLotteryRepository.findOne({
      where: { bancaId, lotteryId, isEnabled: true },
    });

    if (!bancaLottery) {
      throw new NotFoundException(`Lottery ${lotteryId} not enabled for banca ${bancaId}`);
    }

    // Get all draws for this lottery
    const allDraws = await this.lotteryDrawRepository.find({
      where: { lotteryId, status: 'active' },
    });

    // Get enabled draws for this banca
    const bancaDraws = await this.bancaDrawRepository.find({
      where: { bancaId, isEnabled: true },
      relations: ['lotteryDraw'],
    });

    const bancaDrawIds = new Set(bancaDraws.map(bd => bd.lotteryDrawId));

    // Filter draws that belong to this lottery and are enabled for this banca
    const draws: BancaDrawDto[] = allDraws
      .filter(draw => bancaDrawIds.has(draw.id))
      .map(draw => {
        const bancaDraw = bancaDraws.find(bd => bd.lotteryDrawId === draw.id);
        const daysMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        
        return {
          id: draw.id,
          name: draw.name,
          time: draw.drawTime,
          days: draw.daysOfWeek.map(d => daysMap[d]),
          enabled: true,
          earlyCloseMinutes: bancaDraw?.customCloseBeforeMinutes || draw.closeBeforeMinutes,
        };
      });

    return { draws };
  }

  async getBetConfigForBanca(bancaId: string): Promise<BancaBetConfigDto> {
    // Verify banca exists
    const banca = await this.bancaRepository.findById(bancaId);
    if (!banca) {
      throw new NotFoundException(`Banca with id ${bancaId} not found`);
    }

    // Get bet configurations for this banca
    const betConfigs = await this.betConfigRepository.find({
      where: { bancaId, isEnabled: true },
      relations: ['betType'],
    });

    const betTypes: BetTypeConfigDto[] = betConfigs.map(config => ({
      type: config.betTypeId,
      minAmount: Number(config.minBetAmount),
      maxAmount: Number(config.maxBetAmount),
      increment: Number(config.betIncrement),
      multiplier: Number(config.prizeMultiplier),
      maxPrize: config.maxPrizeAmount ? Number(config.maxPrizeAmount) : undefined,
    }));

    // For now, return empty blocked numbers and limits
    // These can be extended later when the full blocking system is implemented
    return {
      betTypes,
      blockedNumbers: [],
      numberLimits: [],
    };
  }
}
