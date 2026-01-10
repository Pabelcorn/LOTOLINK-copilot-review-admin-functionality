import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { 
  PaymentGateway, 
  PAYMENT_GATEWAY,
  PaymentMethod,
  CreatePaymentMethodRequest,
  TokenizeCardRequest,
  CardDetails,
} from '../../payments/payment-gateway.port';

/**
 * Payment Methods Controller
 * Manages credit/debit card registration and management
 */
@Controller('api/v1/users/:userId/payment-methods')
@UseGuards(JwtAuthGuard)
export class PaymentMethodsController {
  constructor(
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: PaymentGateway,
  ) {}

  /**
   * Create a new payment method (credit/debit card)
   * @param userId User ID
   * @param body Payment method creation request
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPaymentMethod(
    @Param('userId') userId: string,
    @Body() body: { token: string; type: 'card' | 'bank_account'; setAsDefault?: boolean },
  ): Promise<PaymentMethod> {
    const request: CreatePaymentMethodRequest = {
      userId,
      type: body.type,
      token: body.token,
      setAsDefault: body.setAsDefault,
    };

    return this.paymentGateway.createPaymentMethod(request);
  }

  /**
   * Server-side tokenization endpoint - DISABLED FOR PCI COMPLIANCE
   * This endpoint is intentionally blocked to prevent server-side handling of raw card data.
   * Card data must be tokenized client-side using Stripe Elements or Stripe SDK.
   * Use POST /payment-methods with a Stripe token instead.
   */
  @Post('tokenize')
  @HttpCode(HttpStatus.FORBIDDEN)
  async tokenizeCard(): Promise<never> {
    throw new ForbiddenException(
      'Server-side card tokenization is disabled for PCI compliance. ' +
      'Card data must be tokenized client-side using Stripe Elements or Stripe SDK. ' +
      'Use POST /payment-methods with a Stripe token instead.'
    );
  }

  /**
   * List all payment methods for a user
   * @param userId User ID
   */
  @Get()
  async listPaymentMethods(
    @Param('userId') userId: string,
  ): Promise<PaymentMethod[]> {
    return this.paymentGateway.listPaymentMethods(userId);
  }

  /**
   * Delete a payment method
   * @param userId User ID
   * @param paymentMethodId Payment method ID to delete
   */
  @Delete(':paymentMethodId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePaymentMethod(
    @Param('userId') userId: string,
    @Param('paymentMethodId') paymentMethodId: string,
  ): Promise<void> {
    const success = await this.paymentGateway.deletePaymentMethod(userId, paymentMethodId);
    
    if (!success) {
      throw new NotFoundException('Payment method not found');
    }
  }
}
