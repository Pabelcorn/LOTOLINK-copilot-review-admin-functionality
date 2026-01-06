import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { NotificationService } from '../../../application/services/notification.service';

@Controller('api/v1/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('devices')
  async registerDevice(@Req() req: any, @Body() dto: any) {
    return this.notificationService.registerDevice(req.user.id, dto);
  }

  @Delete('devices/:token')
  async unregisterDevice(@Param('token') token: string) {
    await this.notificationService.unregisterDevice(decodeURIComponent(token));
    return { success: true };
  }

  @Get('preferences')
  async getPreferences(@Req() req: any) {
    return this.notificationService.getPreferences(req.user.id);
  }

  @Put('preferences')
  async updatePreferences(@Req() req: any, @Body() dto: any) {
    return this.notificationService.updatePreferences(req.user.id, dto);
  }

  @Get('history')
  async getHistory(@Req() req: any, @Query('limit') limit?: number) {
    return this.notificationService.getNotificationHistory(req.user.id, limit);
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    const count = await this.notificationService.getUnreadCount(req.user.id);
    return { count };
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string) {
    await this.notificationService.markAsRead(id);
    return { success: true };
  }
}
