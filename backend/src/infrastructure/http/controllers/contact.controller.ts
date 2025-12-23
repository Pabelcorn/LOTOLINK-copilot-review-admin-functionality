import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EmailService } from '../../email/email.service';
import { BancaRegistrationDto, ContactFormDto } from '../../../application/dtos/contact.dto';

@Controller('api/v1/contact')
export class ContactController {
  constructor(private readonly emailService: EmailService) {}

  @Post('registration')
  @HttpCode(HttpStatus.OK)
  async submitRegistration(@Body() dto: BancaRegistrationDto): Promise<{ success: boolean; message: string }> {
    // Send notification to admin
    const notificationSent = await this.emailService.sendRegistrationNotification({
      bancaName: dto.bancaName,
      ownerName: dto.ownerName,
      phone: dto.phone,
      email: dto.email,
      location: dto.location,
      bankAccount: dto.bankAccount,
    });

    // Only send confirmation to user if admin notification was successful
    if (notificationSent && dto.email) {
      await this.emailService.sendRegistrationConfirmation(dto.email, dto.bancaName);
    }

    return {
      success: true,
      message: notificationSent 
        ? 'Solicitud enviada exitosamente. Revisa tu correo para confirmación.'
        : 'Solicitud recibida. Te contactaremos pronto.',
    };
  }

  @Post('join')
  @HttpCode(HttpStatus.OK)
  async submitContactForm(@Body() dto: ContactFormDto): Promise<{ success: boolean; message: string }> {
    const sent = await this.emailService.sendContactFormNotification({
      name: dto.name,
      location: dto.location,
      phone: dto.phone,
    });

    return {
      success: true,
      message: sent 
        ? 'Solicitud enviada exitosamente. Nos pondremos en contacto contigo pronto.'
        : 'Solicitud recibida. Te contactaremos pronto.',
    };
  }
}
