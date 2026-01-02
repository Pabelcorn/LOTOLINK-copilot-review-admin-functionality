export enum BetTypeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface BetTypeProps {
  id: string;
  name: string;
  description?: string;
  numbersRequired: number;
  numbersOrdered: boolean;
  defaultPrizeMultiplier: number;
  status?: BetTypeStatus;
  displayOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class BetType {
  readonly id: string;
  private _name: string;
  private _description?: string;
  private _numbersRequired: number;
  private _numbersOrdered: boolean;
  private _defaultPrizeMultiplier: number;
  private _status: BetTypeStatus;
  private _displayOrder: number;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: BetTypeProps) {
    this.id = props.id;
    this._name = props.name;
    this._description = props.description;
    this._numbersRequired = props.numbersRequired;
    this._numbersOrdered = props.numbersOrdered;
    this._defaultPrizeMultiplier = props.defaultPrizeMultiplier;
    this._status = props.status || BetTypeStatus.ACTIVE;
    this._displayOrder = props.displayOrder || 0;
    this.createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // Getters
  get name(): string {
    return this._name;
  }

  get description(): string | undefined {
    return this._description;
  }

  get numbersRequired(): number {
    return this._numbersRequired;
  }

  get numbersOrdered(): boolean {
    return this._numbersOrdered;
  }

  get defaultPrizeMultiplier(): number {
    return this._defaultPrizeMultiplier;
  }

  get status(): BetTypeStatus {
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
    this._status = BetTypeStatus.ACTIVE;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._status = BetTypeStatus.INACTIVE;
    this._updatedAt = new Date();
  }

  updateInfo(name?: string, description?: string): void {
    if (name) this._name = name;
    if (description !== undefined) this._description = description;
    this._updatedAt = new Date();
  }

  updateDefaultMultiplier(multiplier: number): void {
    if (multiplier <= 0) {
      throw new Error('Prize multiplier must be positive');
    }
    this._defaultPrizeMultiplier = multiplier;
    this._updatedAt = new Date();
  }

  updateDisplayOrder(order: number): void {
    this._displayOrder = order;
    this._updatedAt = new Date();
  }

  isActive(): boolean {
    return this._status === BetTypeStatus.ACTIVE;
  }

  validateNumberCount(numbers: string[]): boolean {
    return numbers.length === this._numbersRequired;
  }

  toJSON() {
    return {
      id: this.id,
      name: this._name,
      description: this._description,
      numbersRequired: this._numbersRequired,
      numbersOrdered: this._numbersOrdered,
      defaultPrizeMultiplier: this._defaultPrizeMultiplier,
      status: this._status,
      displayOrder: this._displayOrder,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
