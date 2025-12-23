import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { UserService } from '../../../application/services/user.service';
import { ChargeWalletDto, WalletResponseDto } from '../../../application/dtos/user.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { 
  PaymentGateway, 
  PAYMENT_GATEWAY,
  ChargeRequest,
  ChargeResult,
} from '../../payments/payment-gateway.port';

@Controller('api/v1/users')
export class UsersController {
  constructor(
    private readonly userService: UserService,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: PaymentGateway,
  ) {}

  @Post(':userId/wallet/charge')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async chargeWallet(
    @Param('userId') userId: string,
    @Body() chargeWalletDto: ChargeWalletDto,
  ): Promise<WalletResponseDto> {
    return this.userService.chargeWallet(userId, chargeWalletDto);
  }

  @Post(':userId/wallet/debit')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async debitWallet(
    @Param('userId') userId: string,
    @Body() body: { amount: number },
  ): Promise<WalletResponseDto> {
    return this.userService.debitWallet(userId, body.amount);
  }

  /**
   * Charge wallet using a stored payment method (credit/debit card)
   * @param userId User ID
   * @param body Request containing payment method ID and amount
   */
  @Post(':userId/wallet/charge-card')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async chargeWalletWithCard(
    @Param('userId') userId: string,
    @Body() body: { 
      paymentMethodId: string; 
      amount: number; 
      currency?: 'DOP' | 'USD';
      description?: string;
    },
  ): Promise<ChargeResult> {
    const request: ChargeRequest = {
      userId,
      amount: body.amount,
      currency: body.currency || 'DOP',
      description: body.description || 'Wallet recharge',
      paymentMethodId: body.paymentMethodId,
      metadata: {
        type: 'wallet_recharge',
      },
    };

    const result = await this.paymentGateway.charge(request);

    // If charge successful, update wallet balance
    if (result.success) {
      await this.userService.chargeWallet(userId, { 
        amount: body.amount,
        method: 'card',
      });
    }

    return result;
  }
}
