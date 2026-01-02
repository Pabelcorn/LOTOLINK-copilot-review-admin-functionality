import { BancaBetConfiguration } from '../entities/banca-bet-configuration.entity';

export interface ConfigurationFilter {
  bancaId?: string;
  lotteryId?: string;
  betTypeId?: string;
  isEnabled?: boolean;
  validAt?: Date;
}

export interface BancaConfigurationRepository {
  // Bet Configurations
  findConfigurationById(id: string): Promise<BancaBetConfiguration | null>;
  findConfigurations(filter: ConfigurationFilter): Promise<BancaBetConfiguration[]>;
  findConfigurationByKeys(
    bancaId: string,
    lotteryId: string,
    betTypeId: string,
    validAt?: Date
  ): Promise<BancaBetConfiguration | null>;
  saveConfiguration(config: BancaBetConfiguration): Promise<BancaBetConfiguration>;
  updateConfiguration(config: BancaBetConfiguration): Promise<BancaBetConfiguration>;
  
  // Banca Lotteries
  enableLotteryForBanca(bancaId: string, lotteryId: string, overrides?: any): Promise<void>;
  disableLotteryForBanca(bancaId: string, lotteryId: string): Promise<void>;
  getLotteriesForBanca(bancaId: string, enabledOnly?: boolean): Promise<any[]>;
  
  // Banca Draws
  enableDrawForBanca(bancaId: string, lotteryDrawId: string, customCloseBeforeMinutes?: number): Promise<void>;
  disableDrawForBanca(bancaId: string, lotteryDrawId: string): Promise<void>;
  getDrawsForBanca(bancaId: string, enabledOnly?: boolean): Promise<any[]>;
  
  // Blocked Numbers
  blockNumber(bancaId: string, number: string, options?: any): Promise<void>;
  unblockNumber(blockId: string): Promise<void>;
  getBlockedNumbers(bancaId: string): Promise<any[]>;
  isNumberBlocked(bancaId: string, number: string, context?: any): Promise<boolean>;
  
  // Number Limits
  setNumberLimit(bancaId: string, number: string, limit: any): Promise<void>;
  getNumberLimit(bancaId: string, number: string, context?: any): Promise<any | null>;
  updateNumberLimit(limitId: string, currentAmount: number): Promise<void>;
}

export const BANCA_CONFIGURATION_REPOSITORY = Symbol('BancaConfigurationRepository');
