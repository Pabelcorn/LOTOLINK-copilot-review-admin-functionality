import { Injectable, Logger, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  PaymentGateway,
  ChargeRequest,
  ChargeResult,
  RefundRequest,
  RefundResult,
  PaymentMethod,
  CreatePaymentMethodRequest,
  TokenizeCardRequest,
} from './payment-gateway.port';
import { SettingsService } from '../../application/services/settings.service';
import { BancaRepository, BANCA_REPOSITORY } from '../../domain/repositories/banca.repository';

/**
 * Stripe Payment Gateway Adapter
 * 
 * Full production-ready implementation with real Stripe integration
 * 
 * Setup:
 * 1. Set STRIPE_SECRET_KEY in environment (from Stripe Dashboard)
 * 2. Set STRIPE_WEBHOOK_SECRET for webhook verification
 * 3. Configure webhook endpoints for async events
 * 
 * Reference: https://stripe.com/docs/api
 */
@Injectable()
export class StripePaymentGateway implements PaymentGateway {
  private readonly logger = new Logger(StripePaymentGateway.name);
  private readonly secretKey: string;
  private readonly webhookSecret: string;
  private readonly stripe: Stripe | null;
  private readonly customers: Map<string, string> = new Map(); // userId -> Stripe customerId

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => SettingsService))
    private readonly settingsService: SettingsService,
    @Inject(BANCA_REPOSITORY)
    private readonly bancaRepository: BancaRepository,
  ) {
    this.secretKey = this.configService.get<string>('STRIPE_SECRET_KEY', '');
    this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET', '');
    
    if (!this.secretKey) {
      this.logger.warn('STRIPE_SECRET_KEY not configured. Payment gateway will not work in production mode.');
      this.stripe = null;
    } else {
      // Initialize Stripe SDK with latest API version
      this.stripe = new Stripe(this.secretKey, {
        apiVersion: '2024-11-20.acacia',
        typescript: true,
      });
      this.logger.log('Stripe Payment Gateway initialized successfully');
    }
  }

  async charge(request: ChargeRequest): Promise<ChargeResult> {
    this.logger.log(`Processing charge for user ${request.userId}: ${request.amount} ${request.currency}`);

    if (!this.stripe) {
      return {
        success: false,
        status: 'failed',
        errorCode: 'NOT_CONFIGURED',
        errorMessage: 'Stripe is not configured. Set STRIPE_SECRET_KEY.',
      };
    }

    if (!request.paymentMethodId) {
      return {
        success: false,
        status: 'failed',
        errorCode: 'NO_PAYMENT_METHOD',
        errorMessage: 'Payment method ID is required',
      };
    }

    try {
      // Get or create Stripe customer
      const customerId = await this.getOrCreateCustomer(request.userId);

      // Calculate commission if configured
      // Priority: 1. Banca-specific config, 2. Global DB settings, 3. Env vars
      let commissionPercentage = this.configService.get<number>('COMMISSION_PERCENTAGE', 0);
      let commissionAccountId = this.configService.get<string>('COMMISSION_STRIPE_ACCOUNT_ID');
      let cardProcessingAccountId = this.configService.get<string>('CARD_PROCESSING_ACCOUNT_ID');
      let configSource = 'env';

      // Try to get global settings from database
      try {
        const dbCommissionPercentage = await this.settingsService.get('commission.percentage');
        const dbCommissionAccountId = await this.settingsService.get('commission.stripeAccountId');
        const dbCardProcessingAccountId = await this.settingsService.get('commission.cardProcessingAccountId');

        if (dbCommissionPercentage) {
          const parsed = parseFloat(dbCommissionPercentage);
          if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
            commissionPercentage = parsed;
            configSource = 'global-db';
          } else {
            this.logger.warn(`Invalid commission percentage in database: ${dbCommissionPercentage}`);
          }
        }
        if (dbCommissionAccountId) {
          commissionAccountId = dbCommissionAccountId;
          configSource = 'global-db';
        }
        if (dbCardProcessingAccountId) {
          cardProcessingAccountId = dbCardProcessingAccountId;
          configSource = 'global-db';
        }
      } catch (error) {
        this.logger.debug('Settings service not available, using env vars for commission');
      }

      // If bancaId is provided, try to get banca-specific configuration
      // NOTE: bancaId is optional and currently not passed by wallet recharge flows.
      // It should be added when implementing banca-specific play flows.
      if (request.bancaId) {
        try {
          const banca = await this.bancaRepository.findById(request.bancaId);
          if (banca) {
            // Override with banca-specific settings if they exist
            if (banca.commissionPercentage !== undefined) {
              commissionPercentage = banca.commissionPercentage;
              configSource = 'banca-specific';
            }
            if (banca.commissionStripeAccountId) {
              commissionAccountId = banca.commissionStripeAccountId;
              configSource = 'banca-specific';
            }
            if (banca.cardProcessingAccountId) {
              cardProcessingAccountId = banca.cardProcessingAccountId;
              configSource = 'banca-specific';
            }
            this.logger.log(`Using ${configSource} configuration for banca: ${banca.name}`);
          }
        } catch (error) {
          this.logger.warn(`Failed to load banca configuration for ${request.bancaId}, using fallback`, error);
        }
      }
      
      let transferData: any = undefined;
      let applicationFeeAmount: number | undefined = undefined;

      // If commission account is configured, calculate the commission and set up transfer
      if (commissionPercentage > 0 && commissionAccountId) {
        // Commission is taken from the payment amount
        // Convert to cents: amount * percentage / 100 * 100 (for cents conversion)
        applicationFeeAmount = Math.round(request.amount * commissionPercentage); // already in cents
        
        // If card processing account is configured, route net payment there
        if (cardProcessingAccountId) {
          transferData = {
            destination: cardProcessingAccountId,
          };
        }

        this.logger.log(`Commission configured (${configSource}): ${commissionPercentage}% = ${applicationFeeAmount / 100} ${request.currency}, destination: ${cardProcessingAccountId || 'platform account'}`);
      }

      // Create payment intent with automatic confirmation
      const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
        amount: Math.round(request.amount * 100), // Stripe uses cents
        currency: request.currency.toLowerCase(),
        customer: customerId,
        payment_method: request.paymentMethodId,
        confirm: true,
        automatic_payment_methods: {
          enabled: false, // We're specifying the payment method
        },
        description: request.description,
        metadata: {
          userId: request.userId,
          commissionPercentage: commissionPercentage.toString(),
          commissionAmount: applicationFeeAmount ? (applicationFeeAmount / 100).toString() : '0',
          ...request.metadata,
        },
      };

      // Add commission/transfer configuration if available
      if (applicationFeeAmount) {
        paymentIntentParams.application_fee_amount = applicationFeeAmount;
      }
      if (transferData) {
        paymentIntentParams.transfer_data = transferData;
      }

      const paymentIntent = await this.stripe.paymentIntents.create(paymentIntentParams);
      
      this.logger.log(`Charge successful: ${paymentIntent.id}`);
      
      // Retrieve the charge to get receipt URL
      let receiptUrl: string | undefined;
      if (paymentIntent.latest_charge) {
        const charge = await this.stripe.charges.retrieve(
          paymentIntent.latest_charge as string
        );
        receiptUrl = charge.receipt_url || undefined;
      }
      
      return {
        success: paymentIntent.status === 'succeeded',
        transactionId: paymentIntent.id,
        chargeId: paymentIntent.latest_charge as string,
        status: this.mapStripeStatus(paymentIntent.status),
        receiptUrl,
      };
    } catch (error) {
      this.logger.error(`Charge failed:`, error);
      
      if (error instanceof Stripe.errors.StripeError) {
        return {
          success: false,
          status: 'failed',
          errorCode: error.code || 'STRIPE_ERROR',
          errorMessage: error.message,
        };
      }
      
      return {
        success: false,
        status: 'failed',
        errorCode: 'CHARGE_FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async refund(request: RefundRequest): Promise<RefundResult> {
    this.logger.log(`Processing refund for charge ${request.chargeId}`);

    if (!this.stripe) {
      return {
        success: false,
        status: 'failed',
        errorCode: 'NOT_CONFIGURED',
        errorMessage: 'Stripe is not configured.',
      };
    }

    try {
      const refund = await this.stripe.refunds.create({
        charge: request.chargeId,
        amount: request.amount ? Math.round(request.amount * 100) : undefined,
        reason: request.reason as Stripe.RefundCreateParams.Reason,
      });

      this.logger.log(`Refund created: ${refund.id}`);
      
      return {
        success: refund.status === 'succeeded',
        refundId: refund.id,
        status: refund.status === 'succeeded' ? 'succeeded' : 
                refund.status === 'pending' ? 'pending' : 'failed',
      };
    } catch (error) {
      this.logger.error(`Refund failed:`, error);
      
      if (error instanceof Stripe.errors.StripeError) {
        return {
          success: false,
          status: 'failed',
          errorCode: error.code || 'STRIPE_ERROR',
          errorMessage: error.message,
        };
      }
      
      return {
        success: false,
        status: 'failed',
        errorCode: 'REFUND_FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async createPaymentMethod(request: CreatePaymentMethodRequest): Promise<PaymentMethod> {
    this.logger.log(`Creating payment method for user ${request.userId}`);

    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured.');
    }

    try {
      // Get or create Stripe customer
      const customerId = await this.getOrCreateCustomer(request.userId);

      // Attach payment method to customer
      const paymentMethod = await this.stripe.paymentMethods.attach(request.token, {
        customer: customerId,
      });

      // If setting as default, update customer default payment method
      if (request.setAsDefault) {
        await this.stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: paymentMethod.id,
          },
        });
      }

      this.logger.log(`Payment method created: ${paymentMethod.id}`);

      return this.mapStripePaymentMethod(paymentMethod, request.setAsDefault || false);
    } catch (error) {
      this.logger.error(`Create payment method failed:`, error);
      
      if (error instanceof Stripe.errors.StripeError) {
        throw new BadRequestException(error.message);
      }
      
      throw error;
    }
  }

  async tokenizeAndCreatePaymentMethod(request: TokenizeCardRequest): Promise<PaymentMethod> {
    this.logger.log(`Tokenizing card for user ${request.userId} (server-side)`);

    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured.');
    }

    try {
      // Get or create Stripe customer
      const customerId = await this.getOrCreateCustomer(request.userId);

      // Create payment method directly with card details
      // This is the secure server-side approach - card details never stored
      const paymentMethod = await this.stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: request.cardDetails.number.replace(/\s/g, ''),
          exp_month: request.cardDetails.exp_month,
          exp_year: request.cardDetails.exp_year,
          cvc: request.cardDetails.cvc,
        },
        billing_details: {
          name: request.cardDetails.name,
        },
      });

      // Attach payment method to customer
      await this.stripe.paymentMethods.attach(paymentMethod.id, {
        customer: customerId,
      });

      // If setting as default, update customer default payment method
      if (request.setAsDefault) {
        await this.stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: paymentMethod.id,
          },
        });
      }

      this.logger.log(`Payment method tokenized and created: ${paymentMethod.id}`);

      return this.mapStripePaymentMethod(paymentMethod, request.setAsDefault || false);
    } catch (error) {
      this.logger.error(`Tokenize and create payment method failed:`, error);
      
      if (error instanceof Stripe.errors.StripeError) {
        throw new BadRequestException(error.message);
      }
      
      throw error;
    }
  }

  async listPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    this.logger.log(`Listing payment methods for user ${userId}`);

    if (!this.stripe) {
      return [];
    }

    try {
      const customerId = this.customers.get(userId);
      
      if (!customerId) {
        this.logger.debug(`No Stripe customer found for user ${userId}`);
        return [];
      }

      // Retrieve customer to get default payment method
      const customer = await this.stripe.customers.retrieve(customerId);
      
      if (customer.deleted) {
        return [];
      }

      const defaultPaymentMethodId = 
        typeof customer.invoice_settings.default_payment_method === 'string'
          ? customer.invoice_settings.default_payment_method
          : customer.invoice_settings.default_payment_method?.id;

      // List all payment methods for customer
      const methods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return methods.data.map(pm => 
        this.mapStripePaymentMethod(pm, pm.id === defaultPaymentMethodId)
      );
    } catch (error) {
      this.logger.error(`List payment methods failed:`, error);
      return [];
    }
  }

  async deletePaymentMethod(userId: string, paymentMethodId: string): Promise<boolean> {
    this.logger.log(`Deleting payment method ${paymentMethodId} for user ${userId}`);

    if (!this.stripe) {
      return false;
    }

    try {
      // Detach payment method from customer
      await this.stripe.paymentMethods.detach(paymentMethodId);
      
      this.logger.log(`Payment method ${paymentMethodId} deleted successfully`);
      return true;
    } catch (error) {
      this.logger.error(`Delete payment method failed:`, error);
      return false;
    }
  }

  async isHealthy(): Promise<boolean> {
    if (!this.stripe) {
      return false;
    }

    try {
      // Verify connection by retrieving balance
      await this.stripe.balance.retrieve();
      return true;
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Verify Stripe webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret || !this.stripe) {
      this.logger.warn('Webhook secret not configured');
      return false;
    }

    try {
      this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
      return true;
    } catch (error) {
      this.logger.error('Webhook signature verification failed:', error);
      return false;
    }
  }

  /**
   * Get or create a Stripe customer for a user
   * 
   * Note: In production, you should store the Stripe customer ID in your database
   * to avoid searching through all customers. This implementation is for demonstration.
   */
  private async getOrCreateCustomer(userId: string): Promise<string> {
    // Check if we already have a customer ID cached
    const cachedCustomerId = this.customers.get(userId);
    if (cachedCustomerId) {
      return cachedCustomerId;
    }

    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    // TODO: In production, retrieve customer ID from database
    // const userRecord = await this.userRepository.findById(userId);
    // if (userRecord.stripeCustomerId) {
    //   this.customers.set(userId, userRecord.stripeCustomerId);
    //   return userRecord.stripeCustomerId;
    // }

    // Search for existing customer by metadata (with pagination)
    // This is not optimal for production - use database storage instead
    let existingCustomer = null;
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore && !existingCustomer) {
      const customers = await this.stripe.customers.list({
        limit: 100,
        starting_after: startingAfter,
      });

      existingCustomer = customers.data.find(
        (c) => c.metadata?.userId === userId
      );

      hasMore = customers.has_more;
      if (hasMore && customers.data.length > 0) {
        startingAfter = customers.data[customers.data.length - 1].id;
      }
    }

    if (existingCustomer) {
      this.customers.set(userId, existingCustomer.id);
      // TODO: Save to database
      // await this.userRepository.updateStripeCustomerId(userId, existingCustomer.id);
      return existingCustomer.id;
    }

    // Create new customer with metadata only
    // Note: In production, you should retrieve the user's actual email from the database
    // and use it here instead of omitting the email field
    const customer = await this.stripe.customers.create({
      metadata: {
        userId,
      },
      description: `LotoLink User ${userId}`,
    });

    this.customers.set(userId, customer.id);
    this.logger.log(`Created Stripe customer ${customer.id} for user ${userId}`);
    
    // TODO: Save to database for future lookups
    // await this.userRepository.updateStripeCustomerId(userId, customer.id);
    
    return customer.id;
  }

  /**
   * Map Stripe payment intent status to our status
   */
  private mapStripeStatus(status: string): 'succeeded' | 'pending' | 'failed' | 'requires_action' {
    switch (status) {
      case 'succeeded':
        return 'succeeded';
      case 'processing':
        return 'pending';
      case 'requires_action':
      case 'requires_confirmation':
      case 'requires_payment_method':
        return 'requires_action';
      default:
        return 'failed';
    }
  }

  /**
   * Map Stripe payment method to our interface
   */
  private mapStripePaymentMethod(pm: Stripe.PaymentMethod, isDefault: boolean): PaymentMethod {
    return {
      id: pm.id,
      type: pm.type === 'card' ? 'card' : 'bank_account',
      last4: pm.card?.last4 || '0000',
      brand: pm.card?.brand,
      expiryMonth: pm.card?.exp_month,
      expiryYear: pm.card?.exp_year,
      isDefault,
    };
  }
}
