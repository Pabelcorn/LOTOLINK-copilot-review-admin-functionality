import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BancaConfigService } from '../../src/application/services/banca-config.service';
import { BANCA_REPOSITORY, BancaRepository } from '../../src/domain/repositories/banca.repository';
import { Banca, BancaStatus, IntegrationType, AuthType } from '../../src/domain/entities/banca.entity';
import { BancaLotteryEntity } from '../../src/infrastructure/database/entities/banca-lottery.db-entity';
import { BancaDrawEntity } from '../../src/infrastructure/database/entities/banca-draw.db-entity';
import { BancaBetConfigurationEntity } from '../../src/infrastructure/database/entities/banca-bet-configuration.db-entity';
import { LotteryEntity } from '../../src/infrastructure/database/entities/lottery.db-entity';
import { LotteryDrawEntity } from '../../src/infrastructure/database/entities/lottery-draw.db-entity';
import { BetTypeEntity } from '../../src/infrastructure/database/entities/bet-type.db-entity';

describe('BancaConfigService', () => {
  let service: BancaConfigService;
  let bancaRepository: jest.Mocked<BancaRepository>;
  let bancaLotteryRepository: any;
  let bancaDrawRepository: any;
  let betConfigRepository: any;

  const mockBancaRepository = {
    findById: jest.fn(),
  };

  const mockBancaLotteryRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockBancaDrawRepository = {
    find: jest.fn(),
  };

  const mockBetConfigRepository = {
    find: jest.fn(),
  };

  const mockLotteryRepository = {
    find: jest.fn(),
  };

  const mockLotteryDrawRepository = {
    find: jest.fn(),
  };

  const mockBetTypeRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BancaConfigService,
        {
          provide: BANCA_REPOSITORY,
          useValue: mockBancaRepository,
        },
        {
          provide: getRepositoryToken(BancaLotteryEntity),
          useValue: mockBancaLotteryRepository,
        },
        {
          provide: getRepositoryToken(BancaDrawEntity),
          useValue: mockBancaDrawRepository,
        },
        {
          provide: getRepositoryToken(BancaBetConfigurationEntity),
          useValue: mockBetConfigRepository,
        },
        {
          provide: getRepositoryToken(LotteryEntity),
          useValue: mockLotteryRepository,
        },
        {
          provide: getRepositoryToken(LotteryDrawEntity),
          useValue: mockLotteryDrawRepository,
        },
        {
          provide: getRepositoryToken(BetTypeEntity),
          useValue: mockBetTypeRepository,
        },
      ],
    }).compile();

    service = module.get<BancaConfigService>(BancaConfigService);
    bancaRepository = module.get(BANCA_REPOSITORY);
    bancaLotteryRepository = module.get(getRepositoryToken(BancaLotteryEntity));
    bancaDrawRepository = module.get(getRepositoryToken(BancaDrawEntity));
    betConfigRepository = module.get(getRepositoryToken(BancaBetConfigurationEntity));

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('getLotteriesForBanca', () => {
    it('should return enabled lotteries for a banca', async () => {
      const bancaId = 'banca-123';
      const mockBanca = {
        id: bancaId,
        name: 'Test Banca',
        integrationType: IntegrationType.API,
        authType: AuthType.HMAC,
        email: 'test@banca.com',
      };

      const mockBancaLottery = {
        bancaId,
        lotteryId: 'loteka',
        isEnabled: true,
        commissionOverride: 15,
        dailyLimit: 50000,
        perBetMax: 5000,
        lottery: {
          id: 'loteka',
          name: 'Loteka',
          logoUrl: 'https://example.com/logo.png',
        },
      };

      bancaRepository.findById.mockResolvedValue(mockBanca as any);
      bancaLotteryRepository.find.mockResolvedValue([mockBancaLottery]);

      const result = await service.getLotteriesForBanca(bancaId);

      expect(bancaRepository.findById).toHaveBeenCalledWith(bancaId);
      expect(bancaLotteryRepository.find).toHaveBeenCalledWith({
        where: { bancaId, isEnabled: true },
        relations: ['lottery'],
      });
      expect(result.lotteries).toHaveLength(1);
      expect(result.lotteries[0]).toEqual({
        id: 'loteka',
        name: 'Loteka',
        logo: 'https://example.com/logo.png',
        enabled: true,
        commission: 15,
        dailyLimit: 50000,
        maxPerBet: 5000,
      });
    });

    it('should throw NotFoundException if banca does not exist', async () => {
      const bancaId = 'non-existent';
      bancaRepository.findById.mockResolvedValue(null);

      await expect(service.getLotteriesForBanca(bancaId)).rejects.toThrow(NotFoundException);
      expect(bancaLotteryRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('getDrawsForBanca', () => {
    it('should throw NotFoundException if banca does not exist', async () => {
      const bancaId = 'non-existent';
      const lotteryId = 'loteka';
      bancaRepository.findById.mockResolvedValue(null);

      await expect(service.getDrawsForBanca(bancaId, lotteryId)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if lottery is not enabled for banca', async () => {
      const bancaId = 'banca-123';
      const lotteryId = 'loteka';
      const mockBanca = {
        id: bancaId,
        name: 'Test Banca',
        integrationType: IntegrationType.API,
        authType: AuthType.HMAC,
        email: 'test@banca.com',
      };

      bancaRepository.findById.mockResolvedValue(mockBanca as any);
      bancaLotteryRepository.findOne.mockResolvedValue(null);

      await expect(service.getDrawsForBanca(bancaId, lotteryId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBetConfigForBanca', () => {
    it('should return bet configuration for a banca', async () => {
      const bancaId = 'banca-123';
      const mockBanca = {
        id: bancaId,
        name: 'Test Banca',
        integrationType: IntegrationType.API,
        authType: AuthType.HMAC,
        email: 'test@banca.com',
      };

      const mockBetConfig = {
        bancaId,
        lotteryId: 'loteka',
        betTypeId: 'quiniela',
        minBetAmount: 10,
        maxBetAmount: 1000,
        betIncrement: 5,
        prizeMultiplier: 60,
        maxPrizeAmount: 60000,
        isEnabled: true,
      };

      bancaRepository.findById.mockResolvedValue(mockBanca as any);
      betConfigRepository.find.mockResolvedValue([mockBetConfig]);

      const result = await service.getBetConfigForBanca(bancaId);

      expect(bancaRepository.findById).toHaveBeenCalledWith(bancaId);
      expect(betConfigRepository.find).toHaveBeenCalledWith({
        where: { bancaId, isEnabled: true },
        relations: ['betType'],
      });
      expect(result.betTypes).toHaveLength(1);
      expect(result.betTypes[0]).toEqual({
        type: 'quiniela',
        minAmount: 10,
        maxAmount: 1000,
        increment: 5,
        multiplier: 60,
        maxPrize: 60000,
      });
    });

    it('should throw NotFoundException if banca does not exist', async () => {
      const bancaId = 'non-existent';
      bancaRepository.findById.mockResolvedValue(null);

      await expect(service.getBetConfigForBanca(bancaId)).rejects.toThrow(NotFoundException);
    });
  });
});
