import { v4 as uuidv4 } from 'uuid';
import { PlayStatus, BetType, Currency } from '../value-objects';

export interface PlayPayment {
  method: 'wallet' | 'card' | 'bank';
  walletTransactionId?: string;
  cardLast4?: string;
}

export interface PlayProps {
  id?: string;
  requestId: string;
  userId: string;
  lotteryId: string;
  numbers: string[];
  betType: BetType;
  amount: number;
  currency: Currency;
  payment: PlayPayment;
  status?: PlayStatus;
  playIdBanca?: string;
  ticketCode?: string;
  bancaId?: string;
  lotteryDrawId?: string;
  betTypeId?: string;
  drawDate?: Date;
  prizeMultiplier?: number;
  potentialPrize?: number;
  actualPrize?: number;
  isWinner?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Play {
  readonly id: string;
  readonly requestId: string;
  readonly userId: string;
  readonly lotteryId: string;
  readonly numbers: string[];
  readonly betType: BetType;
  readonly amount: number;
  readonly currency: Currency;
  readonly payment: PlayPayment;
  private _status: PlayStatus;
  private _playIdBanca?: string;
  private _ticketCode?: string;
  private _bancaId?: string;
  private _lotteryDrawId?: string;
  private _betTypeId?: string;
  private _drawDate?: Date;
  private _prizeMultiplier?: number;
  private _potentialPrize?: number;
  private _actualPrize?: number;
  private _isWinner?: boolean;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: PlayProps) {
    this.id = props.id || uuidv4();
    this.requestId = props.requestId;
    this.userId = props.userId;
    this.lotteryId = props.lotteryId;
    this.numbers = props.numbers;
    this.betType = props.betType;
    this.amount = props.amount;
    this.currency = props.currency;
    this.payment = props.payment;
    this._status = props.status || PlayStatus.PENDING;
    this._playIdBanca = props.playIdBanca;
    this._ticketCode = props.ticketCode;
    this._bancaId = props.bancaId;
    this._lotteryDrawId = props.lotteryDrawId;
    this._betTypeId = props.betTypeId;
    this._drawDate = props.drawDate;
    this._prizeMultiplier = props.prizeMultiplier;
    this._potentialPrize = props.potentialPrize;
    this._actualPrize = props.actualPrize;
    this._isWinner = props.isWinner || false;
    this.createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  get status(): PlayStatus {
    return this._status;
  }

  get playIdBanca(): string | undefined {
    return this._playIdBanca;
  }

  get ticketCode(): string | undefined {
    return this._ticketCode;
  }

  get bancaId(): string | undefined {
    return this._bancaId;
  }

  get lotteryDrawId(): string | undefined {
    return this._lotteryDrawId;
  }

  get betTypeId(): string | undefined {
    return this._betTypeId;
  }

  get drawDate(): Date | undefined {
    return this._drawDate;
  }

  get prizeMultiplier(): number | undefined {
    return this._prizeMultiplier;
  }

  get potentialPrize(): number | undefined {
    return this._potentialPrize;
  }

  get actualPrize(): number | undefined {
    return this._actualPrize;
  }

  get isWinner(): boolean {
    return this._isWinner || false;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  confirm(playIdBanca: string, ticketCode: string): void {
    if (this._status !== PlayStatus.PENDING && this._status !== PlayStatus.PROCESSING) {
      throw new Error(`Cannot confirm play with status ${this._status}`);
    }
    this._status = PlayStatus.CONFIRMED;
    this._playIdBanca = playIdBanca;
    this._ticketCode = ticketCode;
    this._updatedAt = new Date();
  }

  reject(_reason?: string): void {
    if (this._status !== PlayStatus.PENDING && this._status !== PlayStatus.PROCESSING) {
      throw new Error(`Cannot reject play with status ${this._status}`);
    }
    this._status = PlayStatus.REJECTED;
    this._updatedAt = new Date();
  }

  fail(_reason?: string): void {
    if (this._status !== PlayStatus.PENDING && this._status !== PlayStatus.PROCESSING) {
      throw new Error(`Cannot fail play with status ${this._status}`);
    }
    this._status = PlayStatus.FAILED;
    this._updatedAt = new Date();
  }

  markAsProcessing(): void {
    if (this._status !== PlayStatus.PENDING) {
      throw new Error(`Cannot mark as processing play with status ${this._status}`);
    }
    this._status = PlayStatus.PROCESSING;
    this._updatedAt = new Date();
  }

  assignToBanca(bancaId: string): void {
    this._bancaId = bancaId;
    this._updatedAt = new Date();
  }

  setPrizeInfo(
    lotteryDrawId: string,
    betTypeId: string,
    drawDate: Date,
    prizeMultiplier: number,
    potentialPrize: number
  ): void {
    this._lotteryDrawId = lotteryDrawId;
    this._betTypeId = betTypeId;
    this._drawDate = drawDate;
    this._prizeMultiplier = prizeMultiplier;
    this._potentialPrize = potentialPrize;
    this._updatedAt = new Date();
  }

  markAsWinner(actualPrize: number): void {
    this._isWinner = true;
    this._actualPrize = actualPrize;
    this._updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      requestId: this.requestId,
      userId: this.userId,
      lotteryId: this.lotteryId,
      numbers: this.numbers,
      betType: this.betType,
      amount: this.amount,
      currency: this.currency,
      payment: this.payment,
      status: this._status,
      playIdBanca: this._playIdBanca,
      ticketCode: this._ticketCode,
      bancaId: this._bancaId,
      lotteryDrawId: this._lotteryDrawId,
      betTypeId: this._betTypeId,
      drawDate: this._drawDate,
      prizeMultiplier: this._prizeMultiplier,
      potentialPrize: this._potentialPrize,
      actualPrize: this._actualPrize,
      isWinner: this._isWinner,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
