import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Controllers
import {
  PlaysController,
  UsersController,
  WebhooksController,
  HealthController,
  AuthController,
  AdminAuthController,
  AdminBancasController,
} from './infrastructure/http/controllers';
import { PaymentMethodsController } from './infrastructure/http/controllers/payment-methods.controller';
import { ContactController } from './infrastructure/http/controllers/contact.controller';
import { SettingsController } from './infrastructure/http/controllers/settings.controller';
import { PublicSettingsController } from './infrastructure/http/controllers/public-settings.controller';
import { PasswordService } from './infrastructure/security/password.service';

// Services
import { PlayService, UserService, WebhookService, BancaService, SettingsService } from './application/services';
import { EmailService } from './infrastructure/email';

// Database entities
import {
  PlayEntity,
  UserEntity,
  BancaEntity,
  OutgoingRequestEntity,
  WebhookEventEntity,
  SettingEntity,
} from './infrastructure/database/entities';

// Repositories
import {
  TypeOrmPlayRepository,
  TypeOrmUserRepository,
  TypeOrmBancaRepository,
} from './infrastructure/database/repositories';

// Domain repository tokens
import { PLAY_REPOSITORY, USER_REPOSITORY, BANCA_REPOSITORY, BancaRepository } from './domain/repositories';

// Port tokens
import { EVENT_PUBLISHER, CACHE_PORT, BANCA_ADAPTER } from './ports/outgoing';
import { PAYMENT_GATEWAY } from './infrastructure/payments/payment-gateway.port';

// Payment Gateways
import { StripePaymentGateway } from './infrastructure/payments/stripe-payment.gateway';
import { MockPaymentGateway } from './infrastructure/payments/mock-payment.gateway';

// Guards
import { JwtAuthGuard, IdempotencyGuard } from './infrastructure/http/guards';

// Middleware
import { RequestLoggingMiddleware } from './infrastructure/http/middleware';

// Adapters and Workers
import { MockBancaAdapter, ApiBancaAdapter } from './infrastructure/adapters';
import { InMemoryEventPublisher, PlayWorker } from './infrastructure/messaging';

// Mock Cache implementation for development
class MockCachePort {
  private cache = new Map<string, unknown>();
  private locks = new Set<string>();

  async get<T>(key: string): Promise<T | null> {
    return (this.cache.get(key) as T) || null;
  }
  async set<T>(key: string, value: T, _ttlSeconds?: number): Promise<void> {
    this.cache.set(key, value);
  }
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }
  async exists(key: string): Promise<boolean> {
    return this.cache.has(key);
  }
  async acquireLock(key: string, _ttlSeconds: number): Promise<boolean> {
    if (this.locks.has(key)) return false;
    this.locks.add(key);
    return true;
  }
  async releaseLock(key: string): Promise<void> {
    this.locks.delete(key);
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 seconds
      limit: 10, // 10 requests per minute
    }]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get<string>('DATABASE_USERNAME', 'lotolink'),
        password: configService.get<string>('DATABASE_PASSWORD', 'password'),
        database: configService.get<string>('DATABASE_NAME', 'lotolink_db'),
        entities: [PlayEntity, UserEntity, BancaEntity, OutgoingRequestEntity, WebhookEventEntity, SettingEntity],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      PlayEntity,
      UserEntity,
      BancaEntity,
      OutgoingRequestEntity,
      WebhookEventEntity,
      SettingEntity,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'default_secret'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [PlaysController, UsersController, WebhooksController, HealthController, AuthController, AdminAuthController, AdminBancasController, PaymentMethodsController, ContactController, SettingsController, PublicSettingsController],
  providers: [
    // Global rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    
    // Services
    PlayService,
    UserService,
    WebhookService,
    BancaService,
    EmailService,
    SettingsService,
    PasswordService,
    
    // Workers
    PlayWorker,
    
    // Guards
    JwtAuthGuard,
    IdempotencyGuard,
    
    // Repository bindings
    {
      provide: PLAY_REPOSITORY,
      useClass: TypeOrmPlayRepository,
    },
    {
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: BANCA_REPOSITORY,
      useClass: TypeOrmBancaRepository,
    },
    
    // Banca Adapter - uses mock by default, switch to ApiBancaAdapter for production
    {
      provide: BANCA_ADAPTER,
      useFactory: (configService: ConfigService) => {
        const useMock = configService.get<string>('USE_MOCK_BANCA', 'true') === 'true';
        if (useMock) {
          return new MockBancaAdapter(configService);
        }
        return new ApiBancaAdapter(configService);
      },
      inject: [ConfigService],
    },
    
    // Event Publisher
    {
      provide: EVENT_PUBLISHER,
      useClass: InMemoryEventPublisher,
    },
    
    // Cache Port (mock implementation)
    {
      provide: CACHE_PORT,
      useClass: MockCachePort,
    },
    
    // Payment Gateway - uses Stripe in production, mock in development
    {
      provide: PAYMENT_GATEWAY,
      useFactory: (configService: ConfigService, settingsService: SettingsService, bancaRepository: BancaRepository) => {
        const useMock = configService.get<string>('USE_MOCK_PAYMENT', 'true') === 'true';
        if (useMock) {
          return new MockPaymentGateway(configService);
        }
        return new StripePaymentGateway(configService, settingsService, bancaRepository);
      },
      inject: [ConfigService, SettingsService, BANCA_REPOSITORY],
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggingMiddleware).forRoutes('*');
  }
}
