import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SecretsValidator } from '../../src/infrastructure/security/secrets-validator';

describe('SecretsValidator', () => {
  let validator: SecretsValidator;
  let configService: ConfigService;

  const createConfigService = (config: Record<string, string>): ConfigService => {
    return {
      get: jest.fn((key: string, defaultValue?: string) => {
        return config[key] !== undefined ? config[key] : defaultValue;
      }),
    } as any;
  };

  describe('Development Environment', () => {
    it('should pass with all required secrets in development', () => {
      configService = createConfigService({
        NODE_ENV: 'development',
        JWT_SECRET: 'my_secure_jwt_secret_for_dev',
        HMAC_SECRET: 'my_secure_hmac_secret_for_dev',
        DATABASE_PASSWORD: 'my_db_password',
      });

      validator = new SecretsValidator(configService);

      expect(() => validator.onModuleInit()).not.toThrow();
    });

    it('should fail if JWT_SECRET is missing in development', () => {
      configService = createConfigService({
        NODE_ENV: 'development',
        HMAC_SECRET: 'my_secure_hmac_secret_for_dev',
        DATABASE_PASSWORD: 'my_db_password',
      });

      validator = new SecretsValidator(configService);

      expect(() => validator.onModuleInit()).toThrow(
        /Missing required secrets: JWT_SECRET/
      );
    });

    it('should fail if HMAC_SECRET is missing in development', () => {
      configService = createConfigService({
        NODE_ENV: 'development',
        JWT_SECRET: 'my_secure_jwt_secret_for_dev',
        DATABASE_PASSWORD: 'my_db_password',
      });

      validator = new SecretsValidator(configService);

      expect(() => validator.onModuleInit()).toThrow(
        /Missing required secrets: HMAC_SECRET/
      );
    });

    it('should fail if DATABASE_PASSWORD is missing in development', () => {
      configService = createConfigService({
        NODE_ENV: 'development',
        JWT_SECRET: 'my_secure_jwt_secret_for_dev',
        HMAC_SECRET: 'my_secure_hmac_secret_for_dev',
      });

      validator = new SecretsValidator(configService);

      expect(() => validator.onModuleInit()).toThrow(
        /Missing required secrets: DATABASE_PASSWORD/
      );
    });

    it('should warn about insecure values in development but not fail', () => {
      configService = createConfigService({
        NODE_ENV: 'development',
        JWT_SECRET: 'default_secret',
        HMAC_SECRET: 'test_secret',
        DATABASE_PASSWORD: 'password',
      });

      validator = new SecretsValidator(configService);

      // Should log warning but not throw
      expect(() => validator.onModuleInit()).not.toThrow();
    });

    it('should not require Stripe secrets in development', () => {
      configService = createConfigService({
        NODE_ENV: 'development',
        JWT_SECRET: 'my_secure_jwt_secret_for_dev',
        HMAC_SECRET: 'my_secure_hmac_secret_for_dev',
        DATABASE_PASSWORD: 'my_db_password',
        // No STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET
      });

      validator = new SecretsValidator(configService);

      expect(() => validator.onModuleInit()).not.toThrow();
    });
  });

  describe('Production Environment', () => {
    it('should pass with all required secrets in production', () => {
      configService = createConfigService({
        NODE_ENV: 'production',
        JWT_SECRET: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
        HMAC_SECRET: 'z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4',
        DATABASE_PASSWORD: 'complex_db_pass_2024_hijk_lmno_pqrs_tuvw',
        STRIPE_SECRET_KEY: 'stripe_key_abc123def456ghi789jkl012mno345pqr678',
        STRIPE_WEBHOOK_SECRET: 'webhook_key_abc123def456ghi789jkl012mno345pqr678',
      });

      validator = new SecretsValidator(configService);

      expect(() => validator.onModuleInit()).not.toThrow();
    });

    it('should fail if Stripe secrets are missing in production', () => {
      configService = createConfigService({
        NODE_ENV: 'production',
        JWT_SECRET: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
        HMAC_SECRET: 'z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4',
        DATABASE_PASSWORD: 'complex_db_pass_2024_secure',
      });

      validator = new SecretsValidator(configService);

      expect(() => validator.onModuleInit()).toThrow(
        /Missing required secrets:.*STRIPE_SECRET_KEY.*STRIPE_WEBHOOK_SECRET/
      );
    });

    it('should fail if secrets have insecure default values in production', () => {
      configService = createConfigService({
        NODE_ENV: 'production',
        JWT_SECRET: 'default_secret',
        HMAC_SECRET: 'z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4',
        DATABASE_PASSWORD: 'complex_db_pass_2024',
        STRIPE_SECRET_KEY: 'stripe_key_xyz789uvw456rst123opq098lmn567ijk234',
        STRIPE_WEBHOOK_SECRET: 'webhook_key_xyz789uvw456rst123opq098lmn567ijk234',
      });

      validator = new SecretsValidator(configService);

      expect(() => validator.onModuleInit()).toThrow(
        /Insecure default values detected for: JWT_SECRET/
      );
    });

    it('should detect CHANGE_THIS pattern as insecure', () => {
      configService = createConfigService({
        NODE_ENV: 'production',
        JWT_SECRET: 'CHANGE_THIS_TO_SECURE_VALUE',
        HMAC_SECRET: 'z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4',
        DATABASE_PASSWORD: 'complex_db_pass_2024',
        STRIPE_SECRET_KEY: 'stripe_key_xyz789uvw456rst123opq098lmn567ijk234',
        STRIPE_WEBHOOK_SECRET: 'webhook_key_xyz789uvw456rst123opq098lmn567ijk234',
      });

      validator = new SecretsValidator(configService);

      expect(() => validator.onModuleInit()).toThrow(
        /Insecure default values detected for: JWT_SECRET/
      );
    });

    it('should detect GENERA_SECRET pattern as insecure', () => {
      configService = createConfigService({
        NODE_ENV: 'production',
        JWT_SECRET: 'GENERA_SECRET_UNICO_AQUI',
        HMAC_SECRET: 'z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4',
        DATABASE_PASSWORD: 'complex_db_pass_2024',
        STRIPE_SECRET_KEY: 'stripe_key_xyz789uvw456rst123opq098lmn567ijk234',
        STRIPE_WEBHOOK_SECRET: 'webhook_key_xyz789uvw456rst123opq098lmn567ijk234',
      });

      validator = new SecretsValidator(configService);

      expect(() => validator.onModuleInit()).toThrow(
        /Insecure default values detected for: JWT_SECRET/
      );
    });

    it('should detect CAMBIA_ESTO pattern as insecure', () => {
      configService = createConfigService({
        NODE_ENV: 'production',
        JWT_SECRET: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
        HMAC_SECRET: 'CAMBIA_ESTO_SECRET',
        DATABASE_PASSWORD: 'complex_db_pass_2024',
        STRIPE_SECRET_KEY: 'stripe_key_xyz789uvw456rst123opq098lmn567ijk234',
        STRIPE_WEBHOOK_SECRET: 'webhook_key_xyz789uvw456rst123opq098lmn567ijk234',
      });

      validator = new SecretsValidator(configService);

      expect(() => validator.onModuleInit()).toThrow(
        /Insecure default values detected for:.*HMAC_SECRET/
      );
    });

    it('should fail if multiple secrets are insecure in production', () => {
      configService = createConfigService({
        NODE_ENV: 'production',
        JWT_SECRET: 'test',
        HMAC_SECRET: 'password',
        DATABASE_PASSWORD: '123456',
        STRIPE_SECRET_KEY: 'sk_live_1234567890abcdef',
        STRIPE_WEBHOOK_SECRET: 'whsec_1234567890abcdef',
      });

      validator = new SecretsValidator(configService);

      expect(() => validator.onModuleInit()).toThrow(
        /Insecure default values detected for:.*JWT_SECRET.*HMAC_SECRET.*DATABASE_PASSWORD/
      );
    });
  });

  describe('Insecure Value Detection', () => {
    it('should detect "your_password_here" as insecure', () => {
      configService = createConfigService({
        NODE_ENV: 'production',
        JWT_SECRET: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
        HMAC_SECRET: 'z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4',
        DATABASE_PASSWORD: 'your_password_here',
        STRIPE_SECRET_KEY: 'stripe_key_xyz789uvw456rst123opq098lmn567ijk234',
        STRIPE_WEBHOOK_SECRET: 'webhook_key_xyz789uvw456rst123opq098lmn567ijk234',
      });

      validator = new SecretsValidator(configService);

      expect(() => validator.onModuleInit()).toThrow(
        /Insecure default values detected for:.*DATABASE_PASSWORD/
      );
    });

    it('should be case-insensitive when detecting insecure patterns', () => {
      configService = createConfigService({
        NODE_ENV: 'production',
        JWT_SECRET: 'CHANGE_this_VALUE',
        HMAC_SECRET: 'z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4',
        DATABASE_PASSWORD: 'complex_db_pass_2024',
        STRIPE_SECRET_KEY: 'stripe_key_xyz789uvw456rst123opq098lmn567ijk234',
        STRIPE_WEBHOOK_SECRET: 'webhook_key_xyz789uvw456rst123opq098lmn567ijk234',
      });

      validator = new SecretsValidator(configService);

      expect(() => validator.onModuleInit()).toThrow(
        /Insecure default values detected for: JWT_SECRET/
      );
    });
  });
});
