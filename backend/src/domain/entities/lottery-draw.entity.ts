import { v4 as uuidv4 } from 'uuid';

export enum DrawStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface LotteryDrawProps {
  id?: string;
  lotteryId: string;
  name: string;
  code: string;
  drawTime: string; // HH:MM:SS format
  daysOfWeek: number[]; // 1-7 (Monday-Sunday)
  closeBeforeMinutes?: number;
  status?: DrawStatus;
  displayOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class LotteryDraw {
  readonly id: string;
  private _lotteryId: string;
  private _name: string;
  private _code: string;
  private _drawTime: string;
  private _daysOfWeek: number[];
  private _closeBeforeMinutes: number;
  private _status: DrawStatus;
  private _displayOrder: number;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: LotteryDrawProps) {
    this.id = props.id || uuidv4();
    this._lotteryId = props.lotteryId;
    this._name = props.name;
    this._code = props.code;
    this._drawTime = props.drawTime;
    this._daysOfWeek = props.daysOfWeek;
    this._closeBeforeMinutes = props.closeBeforeMinutes || 15;
    this._status = props.status || DrawStatus.ACTIVE;
    this._displayOrder = props.displayOrder || 0;
    this.createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // Getters
  get lotteryId(): string {
    return this._lotteryId;
  }

  get name(): string {
    return this._name;
  }

  get code(): string {
    return this._code;
  }

  get drawTime(): string {
    return this._drawTime;
  }

  get daysOfWeek(): number[] {
    return this._daysOfWeek;
  }

  get closeBeforeMinutes(): number {
    return this._closeBeforeMinutes;
  }

  get status(): DrawStatus {
    return this._status;
  }

  get displayOrder(): number {
    return this._displayOrder;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Business methods
  activate(): void {
    this._status = DrawStatus.ACTIVE;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._status = DrawStatus.INACTIVE;
    this._updatedAt = new Date();
  }

  updateInfo(name?: string, code?: string): void {
    if (name) this._name = name;
    if (code) this._code = code;
    this._updatedAt = new Date();
  }

  updateSchedule(
    drawTime?: string,
    daysOfWeek?: number[],
    closeBeforeMinutes?: number
  ): void {
    if (drawTime) this._drawTime = drawTime;
    if (daysOfWeek) this._daysOfWeek = daysOfWeek;
    if (closeBeforeMinutes !== undefined)
      this._closeBeforeMinutes = closeBeforeMinutes;
    this._updatedAt = new Date();
  }

  updateDisplayOrder(order: number): void {
    this._displayOrder = order;
    this._updatedAt = new Date();
  }

  isActive(): boolean {
    return this._status === DrawStatus.ACTIVE;
  }

  isOpenOn(dayOfWeek: number): boolean {
    return this._daysOfWeek.includes(dayOfWeek);
  }

  /**
   * Check if the draw is currently open for bets
   * @param now Current date/time
   * @param customCloseBeforeMinutes Optional override for close time
   */
  isOpenAt(now: Date, customCloseBeforeMinutes?: number): boolean {
    if (!this.isActive()) {
      return false;
    }

    const dayOfWeek = now.getDay() || 7; // Sunday = 0 -> 7
    if (!this.isOpenOn(dayOfWeek)) {
      return false;
    }

    const closeMinutes = customCloseBeforeMinutes || this._closeBeforeMinutes;
    const [hours, minutes] = this._drawTime.split(':').map(Number);
    const drawTime = new Date(now);
    drawTime.setHours(hours, minutes, 0, 0);

    const closeTime = new Date(drawTime.getTime() - closeMinutes * 60 * 1000);

    return now < closeTime;
  }

  /**
   * Get the next draw date/time
   */
  getNextDrawTime(fromDate: Date = new Date()): Date | null {
    if (!this.isActive() || this._daysOfWeek.length === 0) {
      return null;
    }

    const [hours, minutes] = this._drawTime.split(':').map(Number);
    let currentDay = fromDate.getDay() || 7;
    let daysToAdd = 0;

    // Try today first
    if (this._daysOfWeek.includes(currentDay)) {
      const todayDraw = new Date(fromDate);
      todayDraw.setHours(hours, minutes, 0, 0);
      if (todayDraw > fromDate) {
        return todayDraw;
      }
    }

    // Find next available day
    for (let i = 1; i <= 7; i++) {
      const nextDay = ((currentDay + i - 1) % 7) + 1;
      if (this._daysOfWeek.includes(nextDay)) {
        daysToAdd = i;
        break;
      }
    }

    if (daysToAdd === 0) {
      return null;
    }

    const nextDraw = new Date(fromDate);
    nextDraw.setDate(nextDraw.getDate() + daysToAdd);
    nextDraw.setHours(hours, minutes, 0, 0);
    return nextDraw;
  }

  toJSON() {
    return {
      id: this.id,
      lotteryId: this._lotteryId,
      name: this._name,
      code: this._code,
      drawTime: this._drawTime,
      daysOfWeek: this._daysOfWeek,
      closeBeforeMinutes: this._closeBeforeMinutes,
      status: this._status,
      displayOrder: this._displayOrder,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
