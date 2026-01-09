import { Controller, Get, Post, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { PrizeService } from '../../../application/services/prize.service';
import { 
  ClaimPrizeDto, 
  VerifyPrizeDto, 
  ApprovePrizeDto, 
  RejectPrizeDto, 
  ProcessPaymentDto,
  PrizeResponseDto,
  PrizeListDto
} from '../../../application/dtos/prize.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('prizes')
export class PrizeController {
  constructor(private readonly prizeService: PrizeService) {}

  // User endpoints
  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async getUserPrizes(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<PrizeListDto> {
    return this.prizeService.getUserPrizes(userId, limit, offset);
  }

  @Get(':prizeId')
  @UseGuards(JwtAuthGuard)
  async getPrizeById(@Param('prizeId') prizeId: string): Promise<PrizeResponseDto> {
    return this.prizeService.getPrizeById(prizeId);
  }

  @Post(':prizeId/claim')
  @UseGuards(JwtAuthGuard)
  async claimPrize(
    @Param('prizeId') prizeId: string,
    @Request() req: any,
    @Body() dto: ClaimPrizeDto,
  ): Promise<PrizeResponseDto> {
    const userId = req.user?.userId || req.user?.sub;
    return this.prizeService.claimPrize(prizeId, userId, dto);
  }

  // Admin endpoints
  @Get('admin/pending')
  @UseGuards(JwtAuthGuard)
  async getPendingPrizes(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<PrizeListDto> {
    return this.prizeService.getPendingPrizes(limit, offset);
  }

  @Post(':prizeId/verify')
  @UseGuards(JwtAuthGuard)
  async verifyPrize(
    @Param('prizeId') prizeId: string,
    @Body() dto: VerifyPrizeDto,
  ): Promise<PrizeResponseDto> {
    return this.prizeService.verifyPrize(prizeId, dto);
  }

  @Post(':prizeId/approve')
  @UseGuards(JwtAuthGuard)
  async approvePrize(
    @Param('prizeId') prizeId: string,
    @Body() dto: ApprovePrizeDto,
  ): Promise<PrizeResponseDto> {
    return this.prizeService.approvePrize(prizeId, dto);
  }

  @Post(':prizeId/reject')
  @UseGuards(JwtAuthGuard)
  async rejectPrize(
    @Param('prizeId') prizeId: string,
    @Body() dto: RejectPrizeDto,
  ): Promise<PrizeResponseDto> {
    return this.prizeService.rejectPrize(prizeId, dto);
  }

  @Post(':prizeId/pay')
  @UseGuards(JwtAuthGuard)
  async processPrizePayment(
    @Param('prizeId') prizeId: string,
    @Body() dto: ProcessPaymentDto,
  ): Promise<PrizeResponseDto> {
    return this.prizeService.processPrizePayment(prizeId, dto);
  }

  @Get('banca/:bancaId')
  @UseGuards(JwtAuthGuard)
  async getBancaPrizes(
    @Param('bancaId') bancaId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<PrizeListDto> {
    return this.prizeService.getBancaPrizes(bancaId, limit, offset);
  }
}
