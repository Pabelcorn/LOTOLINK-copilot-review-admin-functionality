import { v4 as uuidv4 } from 'uuid';

export interface BancaBetConfigurationProps {
  id?: string;
  bancaId: string;
  lotteryId: string;
  betTypeId: string;
  minBetAmount: number;
  maxBetAmount: number;
  betIncrement: number;
  prizeMultiplier: number;
  maxPrizeAmount?: number;
  commissionPercentage?: number;
  isEnabled?: boolean;
  validFrom?: Date;
  validUntil?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class BancaBetConfiguration {
  readonly id: string;
  private _bancaId: string;
  private _lotteryId: string;
  private _betTypeId: string;
  private _minBetAmount: number;
  private _maxBetAmount: number;
  private _betIncrement: number;
  private _prizeMultiplier: number;
  private _maxPrizeAmount?: number;
  private _commissionPercentage?: number;
  private _isEnabled: boolean;
  private _validFrom: Date;
  private _validUntil?: Date;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: BancaBetConfigurationProps) {
    this.id = props.id || uuidv4();
    this._bancaId = props.bancaId;
    this._lotteryId = props.lotteryId;
    this._betTypeId = props.betTypeId;
    this._minBetAmount = props.minBetAmount;
    this._maxBetAmount = props.maxBetAmount;
    this._betIncrement = props.betIncrement;
    this._prizeMultiplier = props.prizeMultiplier;
    this._maxPrizeAmount = props.maxPrizeAmount;
    this._commissionPercentage = props.commissionPercentage;
    this._isEnabled = props.isEnabled !== undefined ? props.isEnabled : true;
    this._validFrom = props.validFrom || new Date();
    this._validUntil = props.validUntil;
    this.createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();

    this.validate();
  }

  private validate(): void {
    if (this._minBetAmount <= 0) {
      throw new Error('Minimum bet amount must be positive');
    }
    if (this._maxBetAmount < this._minBetAmount) {
      throw new Error('Maximum bet amount must be greater than minimum');
    }
    if (this._betIncrement <= 0) {
      throw new Error('Bet increment must be positive');
    }
    if (this._prizeMultiplier <= 0) {
      throw new Error('Prize multiplier must be positive');
    }
    if (
      this._commissionPercentage !== undefined &&
      (this._commissionPercentage < 0 || this._commissionPercentage > 1)
    ) {
      throw new Error('Commission percentage must be between 0 and 1');
    }
  }

  // Getters
  get bancaId(): string {
    return this._bancaId;
  }

  get lotteryId(): string {
    return this._lotteryId;
  }

  get betTypeId(): string {
    return this._betTypeId;
  }

  get minBetAmount(): number {
    return this._minBetAmount;
  }

  get maxBetAmount(): number {
    return this._maxBetAmount;
  }

  get betIncrement(): number {
    return this._betIncrement;
  }

  get prizeMultiplier(): number {
    return this._prizeMultiplier;
  }

  get maxPrizeAmount(): number | undefined {
    return this._maxPrizeAmount;
  }

  get commissionPercentage(): number | undefined {
    return this._commissionPercentage;
  }

  get isEnabled(): boolean {
    return this._isEnabled;
  }

  get validFrom(): Date {
    return this._validFrom;
  }

  get validUntil(): Date | undefined {
    return this._validUntil;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Business methods
  enable(): void {
    this._isEnabled = true;
    this._updatedAt = new Date();
  }

  disable(): void {
    this._isEnabled = false;
    this._updatedAt = new Date();
  }

  updatePricing(
    minBetAmount?: number,
    maxBetAmount?: number,
    betIncrement?: number
  ): void {
    if (minBetAmount !== undefined) this._minBetAmount = minBetAmount;
    if (maxBetAmount !== undefined) this._maxBetAmount = maxBetAmount;
    if (betIncrement !== undefined) this._betIncrement = betIncrement;
    this.validate();
    this._updatedAt = new Date();
  }

  updatePrizeMultiplier(multiplier: number, maxPrizeAmount?: number): void {
    this._prizeMultiplier = multiplier;
    if (maxPrizeAmount !== undefined) this._maxPrizeAmount = maxPrizeAmount;
    this.validate();
    this._updatedAt = new Date();
  }

  updateCommission(commissionPercentage: number): void {
    this._commissionPercentage = commissionPercentage;
    this.validate();
    this._updatedAt = new Date();
  }

  updateValidity(validFrom?: Date, validUntil?: Date): void {
    if (validFrom) this._validFrom = validFrom;
    if (validUntil !== undefined) this._validUntil = validUntil;
    this._updatedAt = new Date();
  }

  /**
   * Check if bet amount is valid according to configuration
   */
  isValidBetAmount(amount: number): boolean {
    if (amount < this._minBetAmount || amount > this._maxBetAmount) {
      return false;
    }
    // Check if amount is a multiple of increment
    const remainder = (amount - this._minBetAmount) % this._betIncrement;
    return Math.abs(remainder) < 0.01; // Allow for floating point precision
  }

  /**
   * Calculate potential prize for a bet amount
   */
  calculatePotentialPrize(betAmount: number): number {
    if (!this.isValidBetAmount(betAmount)) {
      throw new Error('Invalid bet amount');
    }

    const prize = betAmount * this._prizeMultiplier;

    if (this._maxPrizeAmount && prize > this._maxPrizeAmount) {
      return this._maxPrizeAmount;
    }

    return prize;
  }

  /**
   * Calculate commission for a bet amount
   */
  calculateCommission(betAmount: number, defaultCommission: number = 0.05): number {
    const rate = this._commissionPercentage ?? defaultCommission;
    return betAmount * rate;
  }

  /**
   * Check if configuration is currently valid
   */
  isCurrentlyValid(now: Date = new Date()): boolean {
    if (!this._isEnabled) {
      return false;
    }

    if (this._validFrom > now) {
      return false;
    }

    if (this._validUntil && this._validUntil < now) {
      return false;
    }

    return true;
  }

  toJSON() {
    return {
      id: this.id,
      bancaId: this._bancaId,
      lotteryId: this._lotteryId,
      betTypeId: this._betTypeId,
      minBetAmount: this._minBetAmount,
      maxBetAmount: this._maxBetAmount,
      betIncrement: this._betIncrement,
      prizeMultiplier: this._prizeMultiplier,
      maxPrizeAmount: this._maxPrizeAmount,
      commissionPercentage: this._commissionPercentage,
      isEnabled: this._isEnabled,
      validFrom: this._validFrom,
      validUntil: this._validUntil,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
