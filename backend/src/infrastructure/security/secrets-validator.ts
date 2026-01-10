import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecretsValidator implements OnModuleInit {
  private readonly logger = new Logger(SecretsValidator.name);
  
  constructor(private readonly configService: ConfigService) {}
  
  onModuleInit(): void {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    
    const requiredSecrets = [
      'JWT_SECRET',
      'HMAC_SECRET',
      'DATABASE_PASSWORD',
    ];
    
    // These are required in production only
    const productionSecrets = [
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
    ];
    
    const allRequired = isProduction 
      ? [...requiredSecrets, ...productionSecrets]
      : requiredSecrets;
    
    const missing: string[] = [];
    const insecure: string[] = [];
    
    for (const secret of allRequired) {
      const value = this.configService.get<string>(secret);
      
      if (!value) {
        missing.push(secret);
      } else if (this.isInsecureValue(value)) {
        insecure.push(secret);
      }
    }
    
    if (missing.length > 0) {
      const error = `FATAL: Missing required secrets: ${missing.join(', ')}. Application cannot start.`;
      this.logger.error(error);
      throw new Error(error);
    }
    
    if (insecure.length > 0 && isProduction) {
      const error = `FATAL: Insecure default values detected for: ${insecure.join(', ')}. Change these before production deployment.`;
      this.logger.error(error);
      throw new Error(error);
    }
    
    if (insecure.length > 0) {
      this.logger.warn(`WARNING: Using insecure default values for: ${insecure.join(', ')}. This is OK for development only.`);
    }
    
    this.logger.log('All required secrets validated successfully');
  }
  
  private isInsecureValue(value: string): boolean {
    const insecurePatterns = [
      'default_secret',
      'default_banca_secret',
      'CHANGE_THIS',
      'GENERA_SECRET',
      'CAMBIA_ESTO',
      'your_password_here',
      'password',
      'secret',
      'test',
      '123456',
    ];
    
    return insecurePatterns.some(pattern => 
      value.toLowerCase().includes(pattern.toLowerCase())
    );
  }
}
