import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingEntity } from '../../infrastructure/database/entities/setting.db-entity';

export interface SystemSettings {
  // Email Settings
  emailEnabled: boolean;
  emailHost: string;
  emailPort: number;
  emailSecure: boolean;
  emailUser: string;
  emailPassword: string;
  emailFrom: string;
  adminEmail: string;
  
  // Commission Settings
  commissionPercentage: number;
  commissionStripeAccountId: string;
  cardProcessingAccountId: string;
}

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);
  private cache: Map<string, string> = new Map();

  constructor(
    @InjectRepository(SettingEntity)
    private readonly settingsRepository: Repository<SettingEntity>,
  ) {
    this.loadCache();
  }

  private async loadCache(): Promise<void> {
    try {
      const settings = await this.settingsRepository.find();
      settings.forEach(setting => {
        this.cache.set(setting.key, setting.value);
      });
      this.logger.log(`Loaded ${settings.length} settings into cache`);
    } catch (error) {
      this.logger.error('Failed to load settings cache:', error);
    }
  }

  async get(key: string, defaultValue?: string): Promise<string | null> {
    // First check cache
    if (this.cache.has(key)) {
      return this.cache.get(key) ?? null;
    }

    // Then check database
    try {
      const setting = await this.settingsRepository.findOne({ where: { key } });
      if (setting) {
        this.cache.set(key, setting.value);
        return setting.value;
      }
    } catch (error) {
      this.logger.error(`Failed to get setting ${key}:`, error);
    }

    return defaultValue ?? null;
  }

  async set(key: string, value: string, description?: string): Promise<void> {
    try {
      let setting = await this.settingsRepository.findOne({ where: { key } });
      
      if (setting) {
        setting.value = value;
        if (description) {
          setting.description = description;
        }
      } else {
        setting = this.settingsRepository.create({
          key,
          value,
          description,
        });
      }

      await this.settingsRepository.save(setting);
      this.cache.set(key, value);
      this.logger.log(`Setting ${key} updated`);
    } catch (error) {
      this.logger.error(`Failed to set setting ${key}:`, error);
      throw error;
    }
  }

  async getAll(): Promise<Record<string, string>> {
    try {
      const settings = await this.settingsRepository.find();
      const result: Record<string, string> = {};
      settings.forEach(setting => {
        result[setting.key] = setting.value;
      });
      return result;
    } catch (error) {
      this.logger.error('Failed to get all settings:', error);
      return {};
    }
  }

  async getSystemSettings(): Promise<Partial<SystemSettings>> {
    const all = await this.getAll();
    return {
      emailEnabled: all['email.enabled'] === 'true',
      emailHost: all['email.host'],
      emailPort: parseInt(all['email.port'] || '587'),
      emailSecure: all['email.secure'] === 'true',
      emailUser: all['email.user'],
      emailPassword: all['email.password'] ? '********' : '', // Masked for security
      emailFrom: all['email.from'],
      adminEmail: all['email.adminEmail'],
      commissionPercentage: parseFloat(all['commission.percentage'] || '0'),
      commissionStripeAccountId: all['commission.stripeAccountId'],
      cardProcessingAccountId: all['commission.cardProcessingAccountId'],
    };
  }

  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<void> {
    const updates: Array<{ key: string; value: string; description: string }> = [];

    if (settings.emailEnabled !== undefined) {
      updates.push({ key: 'email.enabled', value: String(settings.emailEnabled), description: 'Enable/disable email notifications' });
    }
    if (settings.emailHost) {
      updates.push({ key: 'email.host', value: settings.emailHost, description: 'SMTP host for sending emails' });
    }
    if (settings.emailPort !== undefined) {
      updates.push({ key: 'email.port', value: String(settings.emailPort), description: 'SMTP port' });
    }
    if (settings.emailSecure !== undefined) {
      updates.push({ key: 'email.secure', value: String(settings.emailSecure), description: 'Use SSL/TLS for SMTP' });
    }
    if (settings.emailUser) {
      updates.push({ key: 'email.user', value: settings.emailUser, description: 'SMTP username' });
    }
    if (settings.emailPassword) {
      updates.push({ key: 'email.password', value: settings.emailPassword, description: 'SMTP password' });
    }
    if (settings.emailFrom) {
      updates.push({ key: 'email.from', value: settings.emailFrom, description: 'From email address' });
    }
    if (settings.adminEmail) {
      updates.push({ key: 'email.adminEmail', value: settings.adminEmail, description: 'Admin email for notifications' });
    }
    if (settings.commissionPercentage !== undefined) {
      updates.push({ key: 'commission.percentage', value: String(settings.commissionPercentage), description: 'Commission percentage for card payments' });
    }
    if (settings.commissionStripeAccountId) {
      updates.push({ key: 'commission.stripeAccountId', value: settings.commissionStripeAccountId, description: 'Stripe account ID for commissions' });
    }
    if (settings.cardProcessingAccountId) {
      updates.push({ key: 'commission.cardProcessingAccountId', value: settings.cardProcessingAccountId, description: 'Stripe account ID for card processing' });
    }

    for (const update of updates) {
      await this.set(update.key, update.value, update.description);
    }

    this.logger.log(`Updated ${updates.length} system settings`);
  }
}
