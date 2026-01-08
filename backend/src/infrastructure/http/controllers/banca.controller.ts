import { Controller, Get, Param } from '@nestjs/common';
import { BancaConfigService } from '../../../application/services/banca-config.service';

/**
 * Public Banca Controller
 * Handles public-facing banca configuration endpoints
 */
@Controller('bancas')
export class BancaController {
  constructor(private readonly bancaConfigService: BancaConfigService) {}

  /**
   * GET /bancas/:bancaId/lotteries
   * Returns lotteries enabled for this banca with banca-specific configuration
   */
  @Get(':bancaId/lotteries')
  async getBancaLotteries(@Param('bancaId') bancaId: string) {
    return this.bancaConfigService.getLotteriesForBanca(bancaId);
  }

  /**
   * GET /bancas/:bancaId/lotteries/:lotteryId/draws
   * Returns draws for this lottery at this banca
   */
  @Get(':bancaId/lotteries/:lotteryId/draws')
  async getBancaDraws(
    @Param('bancaId') bancaId: string,
    @Param('lotteryId') lotteryId: string,
  ) {
    return this.bancaConfigService.getDrawsForBanca(bancaId, lotteryId);
  }

  /**
   * GET /bancas/:bancaId/bet-config
   * Returns betting configuration (prices, limits, multipliers)
   */
  @Get(':bancaId/bet-config')
  async getBancaBetConfig(@Param('bancaId') bancaId: string) {
    return this.bancaConfigService.getBetConfigForBanca(bancaId);
  }
}
