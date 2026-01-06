import { v4 as uuidv4 } from 'uuid';

export interface NotificationPreferenceProps {
  id?: string;
  userId: string;
  playConfirmed?: boolean;
  drawReminder?: boolean;
  drawResult?: boolean;
  prizeWon?: boolean;
  ticketExpiring?: boolean;
  prizePaid?: boolean;
  promotions?: boolean;
  reminderMinutesBefore?: number;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class NotificationPreference {
  readonly id: string;
  readonly userId: string;
  readonly playConfirmed: boolean;
  readonly drawReminder: boolean;
  readonly drawResult: boolean;
  readonly prizeWon: boolean;
  readonly ticketExpiring: boolean;
  readonly prizePaid: boolean;
  readonly promotions: boolean;
  readonly reminderMinutesBefore: number;
  readonly quietHoursStart?: string;
  readonly quietHoursEnd?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: NotificationPreferenceProps) {
    this.id = props.id || uuidv4();
    this.userId = props.userId;
    this.playConfirmed = props.playConfirmed ?? true;
    this.drawReminder = props.drawReminder ?? true;
    this.drawResult = props.drawResult ?? true;
    this.prizeWon = props.prizeWon ?? true;
    this.ticketExpiring = props.ticketExpiring ?? true;
    this.prizePaid = props.prizePaid ?? true;
    this.promotions = props.promotions ?? true;
    this.reminderMinutesBefore = props.reminderMinutesBefore ?? 30;
    this.quietHoursStart = props.quietHoursStart;
    this.quietHoursEnd = props.quietHoursEnd;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  isInQuietHours(): boolean {
    if (!this.quietHoursStart || !this.quietHoursEnd) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startH, startM] = this.quietHoursStart.split(':').map(Number);
    const [endH, endM] = this.quietHoursEnd.split(':').map(Number);
    
    const start = startH * 60 + startM;
    const end = endH * 60 + endM;
    
    if (start <= end) {
      return currentTime >= start && currentTime <= end;
    } else {
      return currentTime >= start || currentTime <= end;
    }
  }
}
