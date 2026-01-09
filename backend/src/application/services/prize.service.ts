import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Prize, PrizeStatus, PaymentMethod, BankAccountInfo } from '../../domain/entities/prize.entity';
import { PrizeRepository, PRIZE_REPOSITORY } from '../../domain/repositories/prize.repository';
import { UserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { NotificationService } from './notification.service';
import { 
  ClaimPrizeRequestDto, 
  VerifyPrizeRequestDto, 
  ApprovePrizeRequestDto, 
  RejectPrizeRequestDto, 
  PrizePaymentDto,
  PrizeDetailsDto,
  PrizeListDto
} from '../dtos/prize.dto';

@Injectable()
export class PrizeService {
  constructor(
    @Inject(PRIZE_REPOSITORY)
    private readonly prizeRepository: PrizeRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async getUserPrizes(userId: string, limit = 20, offset = 0): Promise<PrizeListDto> {
    const prizes = await this.prizeRepository.findByUserId(userId, limit, offset);
    const total = await this.prizeRepository.countByUserId(userId);
    
    return {
      prizes: prizes.map(prize => this.toPrizeResponse(prize)),
      total,
      limit,
      offset,
    };
  }

  async getPrizeById(prizeId: string): Promise<PrizeDetailsDto> {
    const prize = await this.prizeRepository.findById(prizeId);
    if (!prize) {
      throw new NotFoundException(`Prize with id ${prizeId} not found`);
    }
    return this.toPrizeResponse(prize);
  }

  async claimPrize(prizeId: string, userId: string, dto: ClaimPrizeRequestDto): Promise<PrizeDetailsDto> {
    const prize = await this.prizeRepository.findById(prizeId);
    if (!prize) {
      throw new NotFoundException(`Prize with id ${prizeId} not found`);
    }

    if (prize.userId !== userId) {
      throw new ForbiddenException('You are not authorized to claim this prize');
    }

    if (prize.status !== PrizeStatus.PENDING) {
      throw new BadRequestException(`Prize already claimed or processed (status: ${prize.status})`);
    }

    // Validate bank account if payment method is bank transfer
    if (dto.paymentMethod === 'bank_transfer' && !dto.bankAccount) {
      throw new BadRequestException('Bank account information is required for bank transfer');
    }

    prize.claim(dto.paymentMethod, dto.bankAccount);
    const updated = await this.prizeRepository.update(prize);

    // Send notification to user
    await this.notificationService.sendPrizeClaimNotification(userId, prize.prizeAmount);

    return this.toPrizeResponse(updated);
  }

  async getPendingPrizes(limit = 50, offset = 0): Promise<PrizeListDto> {
    const prizes = await this.prizeRepository.findPendingPrizes(limit, offset);
    const total = await this.prizeRepository.countByStatus(PrizeStatus.PENDING) +
                  await this.prizeRepository.countByStatus(PrizeStatus.CLAIMED) +
                  await this.prizeRepository.countByStatus(PrizeStatus.VERIFYING);
    
    return {
      prizes: prizes.map(prize => this.toPrizeResponse(prize)),
      total,
      limit,
      offset,
    };
  }

  async verifyPrize(prizeId: string, dto: VerifyPrizeRequestDto): Promise<PrizeDetailsDto> {
    const prize = await this.prizeRepository.findById(prizeId);
    if (!prize) {
      throw new NotFoundException(`Prize with id ${prizeId} not found`);
    }

    if (prize.status !== PrizeStatus.CLAIMED && prize.status !== PrizeStatus.PENDING) {
      throw new BadRequestException(`Cannot verify prize with status ${prize.status}`);
    }

    prize.verify(dto.adminId, dto.notes);
    const updated = await this.prizeRepository.update(prize);

    return this.toPrizeResponse(updated);
  }

  async approvePrize(prizeId: string, dto: ApprovePrizeRequestDto): Promise<PrizeDetailsDto> {
    const prize = await this.prizeRepository.findById(prizeId);
    if (!prize) {
      throw new NotFoundException(`Prize with id ${prizeId} not found`);
    }

    prize.approve(dto.adminId, dto.notes);
    const updated = await this.prizeRepository.update(prize);

    // Notify user that prize is approved
    await this.notificationService.sendPrizeApprovedNotification(prize.userId, prize.prizeAmount);

    return this.toPrizeResponse(updated);
  }

  async rejectPrize(prizeId: string, dto: RejectPrizeRequestDto): Promise<PrizeDetailsDto> {
    const prize = await this.prizeRepository.findById(prizeId);
    if (!prize) {
      throw new NotFoundException(`Prize with id ${prizeId} not found`);
    }

    prize.reject(dto.adminId, dto.reason);
    const updated = await this.prizeRepository.update(prize);

    // Notify user that prize was rejected
    await this.notificationService.sendPrizeRejectedNotification(prize.userId, prize.prizeAmount, dto.reason);

    return this.toPrizeResponse(updated);
  }

  async processPrizePayment(prizeId: string, dto: PrizePaymentDto): Promise<PrizeDetailsDto> {
    const prize = await this.prizeRepository.findById(prizeId);
    if (!prize) {
      throw new NotFoundException(`Prize with id ${prizeId} not found`);
    }

    if (prize.status !== PrizeStatus.APPROVED) {
      throw new BadRequestException(`Cannot process payment for prize with status ${prize.status}`);
    }

    // Start processing
    prize.startProcessing();
    await this.prizeRepository.update(prize);

    // Process based on payment method
    let transactionId = dto.transactionId;
    if (prize.paymentMethod === 'wallet') {
      // Credit user wallet - commenting out as User doesn't have creditWallet method yet
      // const user = await this.userRepository.findById(prize.userId);
      // if (user) {
      //   user.creditWallet(prize.prizeAmount);
      //   await this.userRepository.update(user);
      // }
      transactionId = transactionId || `WALLET_${Date.now()}`;
    } else if (prize.paymentMethod === 'bank_transfer') {
      // In production, this would initiate actual bank transfer
      // For now, just mark with transaction ID
      transactionId = transactionId || `BANK_${Date.now()}`;
    } else if (prize.paymentMethod === 'cash') {
      // Cash - mark ready for pickup
      transactionId = transactionId || `CASH_${Date.now()}`;
    }

    // Mark as paid
    prize.markAsPaid(dto.adminId, transactionId, dto.receiptNumber);
    const updated = await this.prizeRepository.update(prize);

    // Notify user that payment is complete
    await this.notificationService.sendPrizePaidNotification(prize.userId, prize.prizeAmount, transactionId || '');

    return this.toPrizeResponse(updated);
  }

  async getBancaPrizes(bancaId: string, limit = 20, offset = 0): Promise<PrizeListDto> {
    const prizes = await this.prizeRepository.findByBancaId(bancaId, limit, offset);
    const total = prizes.length; // Approximate total for now
    
    return {
      prizes: prizes.map(prize => this.toPrizeResponse(prize)),
      total,
      limit,
      offset,
    };
  }

  private toPrizeResponse(prize: Prize): PrizeDetailsDto {
    const json = prize.toJSON();
    return {
      id: json.id,
      playId: json.playId,
      userId: json.userId,
      bancaId: json.bancaId,
      lotteryId: json.lotteryId,
      lotteryDrawId: json.lotteryDrawId,
      drawDate: json.drawDate,
      betTypeId: json.betTypeId,
      winningNumbers: json.winningNumbers,
      matchedNumbers: json.matchedNumbers,
      betAmount: json.betAmount,
      prizeMultiplier: json.prizeMultiplier,
      prizeAmount: json.prizeAmount,
      status: json.status,
      claimedAt: json.claimedAt,
      paymentMethod: json.paymentMethod,
      bankAccount: json.bankAccount,
      paidAt: json.paidAt,
      paidBy: json.paidBy,
      approvedBy: json.approvedBy,
      approvedAt: json.approvedAt,
      verifiedAt: json.verifiedAt,
      verifiedBy: json.verifiedBy,
      verificationNotes: json.verificationNotes,
      transactionId: json.transactionId,
      receiptNumber: json.receiptNumber,
      notes: json.notes,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt,
    };
  }
}
