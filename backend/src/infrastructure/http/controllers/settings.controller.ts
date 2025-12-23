import {
  Controller,
  Get,
  Put,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { SettingsService } from '../../../application/services/settings.service';
import { EmailService } from '../../email/email.service';
import { UpdateSettingsDto } from '../../../application/dtos/settings.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly emailService: EmailService,
  ) {}

  @Get()
  async getSettings() {
    return this.settingsService.getSystemSettings();
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  async updateSettings(@Body() dto: UpdateSettingsDto) {
    await this.settingsService.updateSystemSettings(dto);
    
    // Reinitialize email service with new settings
    if (dto.emailHost || dto.emailUser || dto.emailPassword || dto.emailEnabled !== undefined) {
      await this.emailService.reinitialize();
    }
    
    return {
      success: true,
      message: 'Configuración actualizada exitosamente',
    };
  }

  @Get('test-email')
  async testEmail() {
    // This endpoint can be used to test email configuration
    const settings = await this.settingsService.getSystemSettings();
    return {
      configured: !!settings.emailHost && !!settings.emailUser,
      host: settings.emailHost,
      from: settings.emailFrom,
      adminEmail: settings.adminEmail,
    };
  }
}
