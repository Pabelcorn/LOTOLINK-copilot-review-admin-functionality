import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Enable raw body for webhook signature verification
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const apiPrefix = configService.get<string>('API_PREFIX', '');

  // Security
  app.use(helmet());

  // CORS - configure based on environment
  const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS');
  app.enableCors({
    origin: allowedOrigins 
      ? allowedOrigins.split(',').map(o => o.trim())
      : configService.get<string>('NODE_ENV') === 'production'
        ? false // In production, require explicit ALLOWED_ORIGINS
        : '*', // In development, allow all
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Idempotency-Key',
      'X-Signature',
      'X-Timestamp',
      'X-Request-ID',
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400, // 24 hours
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Set global prefix if configured
  if (apiPrefix) {
    app.setGlobalPrefix(apiPrefix);
  }

  await app.listen(port);
  console.log(`🚀 Lotolink API is running on http://localhost:${port}`);
  console.log(`📚 Health check: http://localhost:${port}/health`);
}

bootstrap();
