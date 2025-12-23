import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { BancaService } from '../../src/application/services/banca.service';
import { BancaRepository, BANCA_REPOSITORY } from '../../src/domain/repositories/banca.repository';
import { Banca, BancaStatus, IntegrationType, AuthType } from '../../src/domain/entities/banca.entity';
import { CreateBancaDto } from '../../src/application/dtos/banca.dto';

describe('BancaService', () => {
  let service: BancaService;
  let repository: jest.Mocked<BancaRepository>;

  const mockBancaRepository = {
    save: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    findByEmail: jest.fn(),
    findByStatus: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BancaService,
        {
          provide: BANCA_REPOSITORY,
          useValue: mockBancaRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<BancaService>(BancaService);
    repository = module.get(BANCA_REPOSITORY);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('createBanca', () => {
    it('should create a new banca successfully', async () => {
      const dto: CreateBancaDto = {
        name: 'Test Banca',
        integrationType: IntegrationType.API,
        email: 'test@banca.com',
        rnc: '123-45678-9',
        address: 'Test Address',
        phone: '+1809555-1234',
      };

      const savedBanca = new Banca({
        ...dto,
        authType: AuthType.HMAC,
        status: BancaStatus.PENDING,
        isActive: false,
      });

      repository.findByName.mockResolvedValue(null);
      repository.findByEmail.mockResolvedValue(null);
      repository.save.mockResolvedValue(savedBanca);

      const result = await service.createBanca(dto);

      expect(repository.findByName).toHaveBeenCalledWith(dto.name);
      expect(repository.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(repository.save).toHaveBeenCalled();
      expect(result.name).toBe(dto.name);
      expect(result.email).toBe(dto.email);
      expect(result.status).toBe(BancaStatus.PENDING);
    });

    it('should throw ConflictException if banca name already exists', async () => {
      const dto: CreateBancaDto = {
        name: 'Existing Banca',
        integrationType: IntegrationType.API,
        email: 'test@banca.com',
      };

      const existingBanca = new Banca({
        name: dto.name,
        integrationType: IntegrationType.API,
        authType: AuthType.HMAC,
        email: 'existing@banca.com',
      });

      repository.findByName.mockResolvedValue(existingBanca);

      await expect(service.createBanca(dto)).rejects.toThrow(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      const dto: CreateBancaDto = {
        name: 'New Banca',
        integrationType: IntegrationType.API,
        email: 'existing@banca.com',
      };

      const existingBanca = new Banca({
        name: 'Other Banca',
        integrationType: IntegrationType.API,
        authType: AuthType.HMAC,
        email: dto.email,
      });

      repository.findByName.mockResolvedValue(null);
      repository.findByEmail.mockResolvedValue(existingBanca);

      await expect(service.createBanca(dto)).rejects.toThrow(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('approveBanca', () => {
    it('should approve a pending banca and generate credentials', async () => {
      const bancaId = 'test-id';
      const pendingBanca = new Banca({
        id: bancaId,
        name: 'Test Banca',
        integrationType: IntegrationType.API,
        authType: AuthType.HMAC,
        email: 'test@banca.com',
        status: BancaStatus.PENDING,
        isActive: false,
      });

      repository.findById.mockResolvedValue(pendingBanca);
      repository.update.mockImplementation(async (banca: Banca) => banca);

      const result = await service.approveBanca(bancaId);

      expect(repository.findById).toHaveBeenCalledWith(bancaId);
      expect(repository.update).toHaveBeenCalled();
      expect(result.banca.status).toBe(BancaStatus.ACTIVE);
      expect(result.banca.isActive).toBe(true);
      expect(result.credentials.clientId).toBeDefined();
      expect(result.credentials.clientSecret).toBeDefined();
      expect(result.credentials.hmacSecret).toBeDefined();
    });

    it('should throw NotFoundException if banca does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.approveBanca('non-existent-id')).rejects.toThrow(NotFoundException);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if banca is not pending', async () => {
      const activeBanca = new Banca({
        name: 'Active Banca',
        integrationType: IntegrationType.API,
        authType: AuthType.HMAC,
        email: 'test@banca.com',
        status: BancaStatus.ACTIVE,
      });

      repository.findById.mockResolvedValue(activeBanca);

      await expect(service.approveBanca('test-id')).rejects.toThrow(ConflictException);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('rejectBanca', () => {
    it('should reject a pending banca', async () => {
      const bancaId = 'test-id';
      const pendingBanca = new Banca({
        id: bancaId,
        name: 'Test Banca',
        integrationType: IntegrationType.API,
        authType: AuthType.HMAC,
        email: 'test@banca.com',
        status: BancaStatus.PENDING,
        isActive: false,
      });

      repository.findById.mockResolvedValue(pendingBanca);
      repository.update.mockImplementation(async (banca: Banca) => banca);

      const result = await service.rejectBanca(bancaId);

      expect(repository.findById).toHaveBeenCalledWith(bancaId);
      expect(repository.update).toHaveBeenCalled();
      expect(result.status).toBe(BancaStatus.REJECTED);
      expect(result.isActive).toBe(false);
    });

    it('should throw NotFoundException if banca does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.rejectBanca('non-existent-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if banca is not pending', async () => {
      const activeBanca = new Banca({
        name: 'Active Banca',
        integrationType: IntegrationType.API,
        authType: AuthType.HMAC,
        email: 'test@banca.com',
        status: BancaStatus.ACTIVE,
      });

      repository.findById.mockResolvedValue(activeBanca);

      await expect(service.rejectBanca('test-id')).rejects.toThrow(ConflictException);
    });
  });

  describe('getBancasByStatus', () => {
    it('should return bancas filtered by status', async () => {
      const pendingBancas = [
        new Banca({
          name: 'Banca 1',
          integrationType: IntegrationType.API,
          authType: AuthType.HMAC,
          email: 'banca1@test.com',
          status: BancaStatus.PENDING,
        }),
        new Banca({
          name: 'Banca 2',
          integrationType: IntegrationType.WHITE_LABEL,
          authType: AuthType.HMAC,
          email: 'banca2@test.com',
          status: BancaStatus.PENDING,
        }),
      ];

      repository.findByStatus.mockResolvedValue(pendingBancas);

      const result = await service.getBancasByStatus(BancaStatus.PENDING);

      expect(repository.findByStatus).toHaveBeenCalledWith(BancaStatus.PENDING);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Banca 1');
      expect(result[1].name).toBe('Banca 2');
    });
  });

  describe('suspendBanca', () => {
    it('should suspend an active banca', async () => {
      const bancaId = 'test-id';
      const activeBanca = new Banca({
        id: bancaId,
        name: 'Active Banca',
        integrationType: IntegrationType.API,
        authType: AuthType.HMAC,
        email: 'test@banca.com',
        status: BancaStatus.ACTIVE,
        isActive: true,
      });

      repository.findById.mockResolvedValue(activeBanca);
      repository.update.mockImplementation(async (banca: Banca) => banca);

      const result = await service.suspendBanca(bancaId);

      expect(result.status).toBe(BancaStatus.SUSPENDED);
      expect(result.isActive).toBe(false);
    });
  });

  describe('activateBanca', () => {
    it('should activate a suspended banca', async () => {
      const bancaId = 'test-id';
      const suspendedBanca = new Banca({
        id: bancaId,
        name: 'Suspended Banca',
        integrationType: IntegrationType.API,
        authType: AuthType.HMAC,
        email: 'test@banca.com',
        status: BancaStatus.SUSPENDED,
        isActive: false,
      });

      repository.findById.mockResolvedValue(suspendedBanca);
      repository.update.mockImplementation(async (banca: Banca) => banca);

      const result = await service.activateBanca(bancaId);

      expect(result.isActive).toBe(true);
      expect(result.status).toBe(BancaStatus.ACTIVE);
    });
  });
});
