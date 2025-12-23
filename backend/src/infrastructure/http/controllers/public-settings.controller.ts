import { Controller, Get } from '@nestjs/common';
import { SettingsService } from '../../../application/services/settings.service';

@Controller('public/settings')
export class PublicSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('app-service-fee')
  async getAppServiceFee() {
    const settings = await this.settingsService.getSystemSettings();
    
    return {
      appServiceFeePercentage: settings.commissionPercentage ?? 7, // Default to 7% if not set
    };
  }
}
