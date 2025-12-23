import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { SettingsService } from '../../application/services/settings.service';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => SettingsService))
    private readonly settingsService: SettingsService,
  ) {
    this.initializeFromEnv();
  }

  private async initializeFromEnv(): Promise<void> {
    const enabled = this.configService.get<boolean>('EMAIL_ENABLED', false);
    
    if (enabled) {
      this.initializeTransporter();
    } else {
      this.logger.warn('Email service is disabled. Set EMAIL_ENABLED=true or configure via admin panel.');
    }
  }

  async reinitialize(): Promise<void> {
    this.logger.log('Reinitializing email service with updated settings');
    await this.initializeTransporter();
  }

  private async initializeTransporter(): Promise<void> {
    // Try to get settings from database first, fall back to env vars
    let host = this.configService.get<string>('EMAIL_HOST');
    let port = this.configService.get<number>('EMAIL_PORT', 587);
    let secure = this.configService.get<boolean>('EMAIL_SECURE', false);
    let user = this.configService.get<string>('EMAIL_USER');
    let pass = this.configService.get<string>('EMAIL_PASSWORD');

    try {
      const dbHost = await this.settingsService.get('email.host');
      const dbPort = await this.settingsService.get('email.port');
      const dbSecure = await this.settingsService.get('email.secure');
      const dbUser = await this.settingsService.get('email.user');
      const dbPass = await this.settingsService.get('email.password');

      if (dbHost) host = dbHost;
      if (dbPort) port = parseInt(dbPort);
      if (dbSecure) secure = dbSecure === 'true';
      if (dbUser) user = dbUser;
      if (dbPass) pass = dbPass;
    } catch (error) {
      this.logger.debug('Settings service not yet available, using env vars');
    }

    if (!host || !user || !pass) {
      this.logger.error(
        'Email configuration is incomplete. Please configure via admin panel or set EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD.'
      );
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      });

      this.logger.log(`Email service initialized with host: ${host}`);
    } catch (error) {
      this.logger.error('Failed to initialize email transporter:', error);
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    // Check if email is enabled from settings or env
    let enabled = this.configService.get<boolean>('EMAIL_ENABLED', false);
    try {
      const dbEnabled = await this.settingsService.get('email.enabled');
      if (dbEnabled) enabled = dbEnabled === 'true';
    } catch (error) {
      // Settings service not available yet
    }

    if (!enabled) {
      this.logger.debug('Email sending is disabled.');
      return false;
    }

    if (!this.transporter) {
      // Try to initialize if not already done
      await this.initializeTransporter();
      if (!this.transporter) {
        this.logger.error('Email transporter is not initialized');
        return false;
      }
    }

    try {
      // Get from address from settings or env
      let from = this.configService.get<string>('EMAIL_FROM', 'noreply@lotolink.com');
      try {
        const dbFrom = await this.settingsService.get('email.from');
        if (dbFrom) from = dbFrom;
      } catch (error) {
        // Use env var
      }

      const mailOptions: any = {
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      };
      
      // Only include text if provided
      if (options.text) {
        mailOptions.text = options.text;
      }

      const info = await this.transporter.sendMail(mailOptions);

      this.logger.log(`Email sent successfully. Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email:`, error);
      return false;
    }
  }

  async sendRegistrationNotification(data: {
    bancaName: string;
    ownerName: string;
    phone: string;
    email: string;
    location: string;
    bankAccount: string;
  }): Promise<boolean> {
    let adminEmail = this.configService.get<string>(
      'ADMIN_EMAIL',
      'admin@lotolink.com'
    );

    // Try to get admin email from settings
    try {
      const dbAdminEmail = await this.settingsService.get('email.adminEmail');
      if (dbAdminEmail) adminEmail = dbAdminEmail;
    } catch (error) {
      // Use env var
    }

    const html = `
      <h2>Nueva Solicitud de Registro de Banca</h2>
      <p>Se ha recibido una nueva solicitud de registro con los siguientes detalles:</p>
      
      <h3>Información de la Banca</h3>
      <ul>
        <li><strong>Nombre de la Banca:</strong> ${data.bancaName}</li>
        <li><strong>Ubicación:</strong> ${data.location}</li>
      </ul>
      
      <h3>Datos de Contacto</h3>
      <ul>
        <li><strong>Propietario:</strong> ${data.ownerName}</li>
        <li><strong>Teléfono:</strong> ${data.phone}</li>
        <li><strong>Email:</strong> ${data.email}</li>
      </ul>
      
      <h3>Datos de Pago</h3>
      <ul>
        <li><strong>Cuenta Bancaria:</strong> ${data.bankAccount}</li>
      </ul>
      
      <p>Por favor, revisa la solicitud y ponte en contacto con el solicitante.</p>
    `;

    const text = `
Nueva Solicitud de Registro de Banca

Información de la Banca:
- Nombre: ${data.bancaName}
- Ubicación: ${data.location}

Datos de Contacto:
- Propietario: ${data.ownerName}
- Teléfono: ${data.phone}
- Email: ${data.email}

Datos de Pago:
- Cuenta Bancaria: ${data.bankAccount}
    `;

    return this.sendEmail({
      to: adminEmail,
      subject: `Nueva Solicitud de Registro: ${data.bancaName}`,
      html,
      text,
    });
  }

  async sendContactFormNotification(data: {
    name: string;
    location: string;
    phone: string;
  }): Promise<boolean> {
    let adminEmail = this.configService.get<string>(
      'ADMIN_EMAIL',
      'admin@lotolink.com'
    );

    // Try to get admin email from settings
    try {
      const dbAdminEmail = await this.settingsService.get('email.adminEmail');
      if (dbAdminEmail) adminEmail = dbAdminEmail;
    } catch (error) {
      // Use env var
    }

    const html = `
      <h2>Nueva Solicitud de Contacto - Únete a LotoLink</h2>
      <p>Alguien está interesado en unirse a LotoLink:</p>
      
      <ul>
        <li><strong>Nombre de la Banca:</strong> ${data.name}</li>
        <li><strong>Ubicación:</strong> ${data.location}</li>
        <li><strong>Teléfono:</strong> ${data.phone}</li>
      </ul>
      
      <p>Por favor, contacta al solicitante para más información.</p>
    `;

    const text = `
Nueva Solicitud de Contacto - Únete a LotoLink

- Nombre de la Banca: ${data.name}
- Ubicación: ${data.location}
- Teléfono: ${data.phone}

Por favor, contacta al solicitante para más información.
    `;

    return this.sendEmail({
      to: adminEmail,
      subject: `Solicitud de Contacto: ${data.name}`,
      html,
      text,
    });
  }

  async sendRegistrationConfirmation(to: string, bancaName: string): Promise<boolean> {
    const html = `
      <h2>¡Gracias por tu Solicitud!</h2>
      <p>Hola,</p>
      <p>Hemos recibido tu solicitud de registro para <strong>${bancaName}</strong>.</p>
      <p>Nuestro equipo revisará tu información y se pondrá en contacto contigo pronto con los próximos pasos.</p>
      
      <p>Mientras tanto, si tienes alguna pregunta, no dudes en contactarnos.</p>
      
      <p>Saludos,<br>El equipo de LotoLink</p>
    `;

    const text = `
¡Gracias por tu Solicitud!

Hola,

Hemos recibido tu solicitud de registro para ${bancaName}.

Nuestro equipo revisará tu información y se pondrá en contacto contigo pronto con los próximos pasos.

Mientras tanto, si tienes alguna pregunta, no dudes en contactarnos.

Saludos,
El equipo de LotoLink
    `;

    return this.sendEmail({
      to,
      subject: 'Confirmación de Solicitud - LotoLink',
      html,
      text,
    });
  }
}
