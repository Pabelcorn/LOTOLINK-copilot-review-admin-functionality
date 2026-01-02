export enum LotteryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface LotteryProps {
  id: string;
  name: string;
  shortName?: string;
  country: string;
  logoUrl?: string;
  websiteUrl?: string;
  numberRangeMin: number;
  numberRangeMax: number;
  status?: LotteryStatus;
  displayOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Lottery {
  readonly id: string;
  private _name: string;
  private _shortName?: string;
  private _country: string;
  private _logoUrl?: string;
  private _websiteUrl?: string;
  private _numberRangeMin: number;
  private _numberRangeMax: number;
  private _status: LotteryStatus;
  private _displayOrder: number;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: LotteryProps) {
    this.id = props.id;
    this._name = props.name;
    this._shortName = props.shortName;
    this._country = props.country;
    this._logoUrl = props.logoUrl;
    this._websiteUrl = props.websiteUrl;
    this._numberRangeMin = props.numberRangeMin;
    this._numberRangeMax = props.numberRangeMax;
    this._status = props.status || LotteryStatus.ACTIVE;
    this._displayOrder = props.displayOrder || 0;
    this.createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // Getters
  get name(): string {
    return this._name;
  }

  get shortName(): string | undefined {
    return this._shortName;
  }

  get country(): string {
    return this._country;
  }

  get logoUrl(): string | undefined {
    return this._logoUrl;
  }

  get websiteUrl(): string | undefined {
    return this._websiteUrl;
  }

  get numberRangeMin(): number {
    return this._numberRangeMin;
  }

  get numberRangeMax(): number {
    return this._numberRangeMax;
  }

  get status(): LotteryStatus {
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
    this._status = LotteryStatus.ACTIVE;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._status = LotteryStatus.INACTIVE;
    this._updatedAt = new Date();
  }

  updateInfo(
    name?: string,
    shortName?: string,
    logoUrl?: string,
    websiteUrl?: string
  ): void {
    if (name) this._name = name;
    if (shortName !== undefined) this._shortName = shortName;
    if (logoUrl !== undefined) this._logoUrl = logoUrl;
    if (websiteUrl !== undefined) this._websiteUrl = websiteUrl;
    this._updatedAt = new Date();
  }

  updateNumberRange(min: number, max: number): void {
    if (min < 0 || max < min) {
      throw new Error('Invalid number range');
    }
    this._numberRangeMin = min;
    this._numberRangeMax = max;
    this._updatedAt = new Date();
  }

  updateDisplayOrder(order: number): void {
    this._displayOrder = order;
    this._updatedAt = new Date();
  }

  isActive(): boolean {
    return this._status === LotteryStatus.ACTIVE;
  }

  isNumberValid(number: number): boolean {
    return number >= this._numberRangeMin && number <= this._numberRangeMax;
  }

  toJSON() {
    return {
      id: this.id,
      name: this._name,
      shortName: this._shortName,
      country: this._country,
      logoUrl: this._logoUrl,
      websiteUrl: this._websiteUrl,
      numberRangeMin: this._numberRangeMin,
      numberRangeMax: this._numberRangeMax,
      status: this._status,
      displayOrder: this._displayOrder,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
