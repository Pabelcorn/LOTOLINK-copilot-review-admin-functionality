import { v4 as uuidv4 } from 'uuid';

export enum PrizeStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PAID = 'paid',
  DISPUTED = 'disputed',
  REJECTED = 'rejected',
}

export interface PrizeProps {
  id?: string;
  playId: string;
  bancaId: string;
  userId: string;
  lotteryId: string;
  lotteryDrawId?: string;
  drawDate: Date;
  betTypeId: string;
  winningNumbers: string[];
  matchedNumbers: string[];
  betAmount: number;
  prizeMultiplier: number;
  prizeAmount: number;
  status?: PrizeStatus;
  paidAt?: Date;
  paidBy?: string;
  verifiedAt?: Date;
  verifiedBy?: string;
  verificationNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Prize {
  readonly id: string;
  private _playId: string;
  private _bancaId: string;
  private _userId: string;
  private _lotteryId: string;
  private _lotteryDrawId?: string;
  private _drawDate: Date;
  private _betTypeId: string;
  private _winningNumbers: string[];
  private _matchedNumbers: string[];
  private _betAmount: number;
  private _prizeMultiplier: number;
  private _prizeAmount: number;
  private _status: PrizeStatus;
  private _paidAt?: Date;
  private _paidBy?: string;
  private _verifiedAt?: Date;
  private _verifiedBy?: string;
  private _verificationNotes?: string;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: PrizeProps) {
    this.id = props.id || uuidv4();
    this._playId = props.playId;
    this._bancaId = props.bancaId;
    this._userId = props.userId;
    this._lotteryId = props.lotteryId;
    this._lotteryDrawId = props.lotteryDrawId;
    this._drawDate = props.drawDate;
    this._betTypeId = props.betTypeId;
    this._winningNumbers = props.winningNumbers;
    this._matchedNumbers = props.matchedNumbers;
    this._betAmount = props.betAmount;
    this._prizeMultiplier = props.prizeMultiplier;
    this._prizeAmount = props.prizeAmount;
    this._status = props.status || PrizeStatus.PENDING;
    this._paidAt = props.paidAt;
    this._paidBy = props.paidBy;
    this._verifiedAt = props.verifiedAt;
    this._verifiedBy = props.verifiedBy;
    this._verificationNotes = props.verificationNotes;
    this.createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // Getters
  get playId(): string {
    return this._playId;
  }

  get bancaId(): string {
    return this._bancaId;
  }

  get userId(): string {
    return this._userId;
  }

  get lotteryId(): string {
    return this._lotteryId;
  }

  get lotteryDrawId(): string | undefined {
    return this._lotteryDrawId;
  }

  get drawDate(): Date {
    return this._drawDate;
  }

  get betTypeId(): string {
    return this._betTypeId;
  }

  get winningNumbers(): string[] {
    return this._winningNumbers;
  }

  get matchedNumbers(): string[] {
    return this._matchedNumbers;
  }

  get betAmount(): number {
    return this._betAmount;
  }

  get prizeMultiplier(): number {
    return this._prizeMultiplier;
  }

  get prizeAmount(): number {
    return this._prizeAmount;
  }

  get status(): PrizeStatus {
    return this._status;
  }

  get paidAt(): Date | undefined {
    return this._paidAt;
  }

  get paidBy(): string | undefined {
    return this._paidBy;
  }

  get verifiedAt(): Date | undefined {
    return this._verifiedAt;
  }

  get verifiedBy(): string | undefined {
    return this._verifiedBy;
  }

  get verificationNotes(): string | undefined {
    return this._verificationNotes;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Business methods
  approve(verifiedBy: string, notes?: string): void {
    if (this._status !== PrizeStatus.PENDING) {
      throw new Error(`Cannot approve prize with status ${this._status}`);
    }
    this._status = PrizeStatus.APPROVED;
    this._verifiedAt = new Date();
    this._verifiedBy = verifiedBy;
    if (notes) this._verificationNotes = notes;
    this._updatedAt = new Date();
  }

  markAsPaid(paidBy: string): void {
    if (this._status !== PrizeStatus.APPROVED && this._status !== PrizeStatus.PENDING) {
      throw new Error(`Cannot mark as paid prize with status ${this._status}`);
    }
    this._status = PrizeStatus.PAID;
    this._paidAt = new Date();
    this._paidBy = paidBy;
    this._updatedAt = new Date();
  }

  dispute(notes: string): void {
    if (this._status === PrizeStatus.PAID || this._status === PrizeStatus.REJECTED) {
      throw new Error(`Cannot dispute prize with status ${this._status}`);
    }
    this._status = PrizeStatus.DISPUTED;
    this._verificationNotes = notes;
    this._updatedAt = new Date();
  }

  reject(verifiedBy: string, reason: string): void {
    if (this._status === PrizeStatus.PAID) {
      throw new Error('Cannot reject a paid prize');
    }
    this._status = PrizeStatus.REJECTED;
    this._verifiedAt = new Date();
    this._verifiedBy = verifiedBy;
    this._verificationNotes = reason;
    this._updatedAt = new Date();
  }

  addVerificationNotes(notes: string, verifiedBy: string): void {
    this._verificationNotes = notes;
    this._verifiedBy = verifiedBy;
    this._verifiedAt = new Date();
    this._updatedAt = new Date();
  }

  isPending(): boolean {
    return this._status === PrizeStatus.PENDING;
  }

  isApproved(): boolean {
    return this._status === PrizeStatus.APPROVED;
  }

  isPaid(): boolean {
    return this._status === PrizeStatus.PAID;
  }

  isDisputed(): boolean {
    return this._status === PrizeStatus.DISPUTED;
  }

  isRejected(): boolean {
    return this._status === PrizeStatus.REJECTED;
  }

  toJSON() {
    return {
      id: this.id,
      playId: this._playId,
      bancaId: this._bancaId,
      userId: this._userId,
      lotteryId: this._lotteryId,
      lotteryDrawId: this._lotteryDrawId,
      drawDate: this._drawDate,
      betTypeId: this._betTypeId,
      winningNumbers: this._winningNumbers,
      matchedNumbers: this._matchedNumbers,
      betAmount: this._betAmount,
      prizeMultiplier: this._prizeMultiplier,
      prizeAmount: this._prizeAmount,
      status: this._status,
      paidAt: this._paidAt,
      paidBy: this._paidBy,
      verifiedAt: this._verifiedAt,
      verifiedBy: this._verifiedBy,
      verificationNotes: this._verificationNotes,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
