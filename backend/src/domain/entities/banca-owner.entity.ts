import { v4 as uuidv4 } from 'uuid';

export enum BancaOwnerStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
}

export enum BankAccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
}

export interface BancaOwnerProps {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  cedula?: string;
  rnc?: string;
  businessName?: string;
  bankName?: string;
  bankAccountType?: BankAccountType;
  bankAccountNumber?: string;
  stripeAccountId?: string;
  defaultCommissionPercentage?: number;
  status?: BancaOwnerStatus;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export class BancaOwner {
  readonly id: string;
  private _firstName: string;
  private _lastName: string;
  private _email: string;
  private _phone?: string;
  private _cedula?: string;
  private _rnc?: string;
  private _businessName?: string;
  private _bankName?: string;
  private _bankAccountType?: BankAccountType;
  private _bankAccountNumber?: string;
  private _stripeAccountId?: string;
  private _defaultCommissionPercentage: number;
  private _status: BancaOwnerStatus;
  private _notes?: string;
  private _metadata: Record<string, any>;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: BancaOwnerProps) {
    this.id = props.id || uuidv4();
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._email = props.email;
    this._phone = props.phone;
    this._cedula = props.cedula;
    this._rnc = props.rnc;
    this._businessName = props.businessName;
    this._bankName = props.bankName;
    this._bankAccountType = props.bankAccountType;
    this._bankAccountNumber = props.bankAccountNumber;
    this._stripeAccountId = props.stripeAccountId;
    this._defaultCommissionPercentage = props.defaultCommissionPercentage || 0.05; // 5%
    this._status = props.status || BancaOwnerStatus.PENDING;
    this._notes = props.notes;
    this._metadata = props.metadata || {};
    this.createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // Getters
  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }

  get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  get email(): string {
    return this._email;
  }

  get phone(): string | undefined {
    return this._phone;
  }

  get cedula(): string | undefined {
    return this._cedula;
  }

  get rnc(): string | undefined {
    return this._rnc;
  }

  get businessName(): string | undefined {
    return this._businessName;
  }

  get bankName(): string | undefined {
    return this._bankName;
  }

  get bankAccountType(): BankAccountType | undefined {
    return this._bankAccountType;
  }

  get bankAccountNumber(): string | undefined {
    return this._bankAccountNumber;
  }

  get stripeAccountId(): string | undefined {
    return this._stripeAccountId;
  }

  get defaultCommissionPercentage(): number {
    return this._defaultCommissionPercentage;
  }

  get status(): BancaOwnerStatus {
    return this._status;
  }

  get notes(): string | undefined {
    return this._notes;
  }

  get metadata(): Record<string, any> {
    return this._metadata;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Business methods
  activate(): void {
    if (this._status === BancaOwnerStatus.PENDING) {
      this._status = BancaOwnerStatus.ACTIVE;
      this._updatedAt = new Date();
    } else {
      throw new Error(`Cannot activate owner with status ${this._status}`);
    }
  }

  suspend(): void {
    if (this._status === BancaOwnerStatus.ACTIVE) {
      this._status = BancaOwnerStatus.SUSPENDED;
      this._updatedAt = new Date();
    } else {
      throw new Error(`Cannot suspend owner with status ${this._status}`);
    }
  }

  reactivate(): void {
    if (this._status === BancaOwnerStatus.SUSPENDED) {
      this._status = BancaOwnerStatus.ACTIVE;
      this._updatedAt = new Date();
    } else {
      throw new Error(`Cannot reactivate owner with status ${this._status}`);
    }
  }

  deactivate(): void {
    this._status = BancaOwnerStatus.INACTIVE;
    this._updatedAt = new Date();
  }

  updateContactInfo(email?: string, phone?: string): void {
    if (email) this._email = email;
    if (phone) this._phone = phone;
    this._updatedAt = new Date();
  }

  updateBusinessInfo(
    cedula?: string,
    rnc?: string,
    businessName?: string
  ): void {
    if (cedula) this._cedula = cedula;
    if (rnc) this._rnc = rnc;
    if (businessName) this._businessName = businessName;
    this._updatedAt = new Date();
  }

  updateBankDetails(
    bankName?: string,
    bankAccountType?: BankAccountType,
    bankAccountNumber?: string
  ): void {
    if (bankName) this._bankName = bankName;
    if (bankAccountType) this._bankAccountType = bankAccountType;
    if (bankAccountNumber) this._bankAccountNumber = bankAccountNumber;
    this._updatedAt = new Date();
  }

  updateStripeAccount(stripeAccountId: string): void {
    this._stripeAccountId = stripeAccountId;
    this._updatedAt = new Date();
  }

  updateCommission(commissionPercentage: number): void {
    if (commissionPercentage < 0 || commissionPercentage > 1) {
      throw new Error('Commission percentage must be between 0 and 1');
    }
    this._defaultCommissionPercentage = commissionPercentage;
    this._updatedAt = new Date();
  }

  updateNotes(notes: string): void {
    this._notes = notes;
    this._updatedAt = new Date();
  }

  updateMetadata(metadata: Record<string, any>): void {
    this._metadata = { ...this._metadata, ...metadata };
    this._updatedAt = new Date();
  }

  isActive(): boolean {
    return this._status === BancaOwnerStatus.ACTIVE;
  }

  toJSON() {
    return {
      id: this.id,
      firstName: this._firstName,
      lastName: this._lastName,
      fullName: this.fullName,
      email: this._email,
      phone: this._phone,
      cedula: this._cedula,
      rnc: this._rnc,
      businessName: this._businessName,
      bankName: this._bankName,
      bankAccountType: this._bankAccountType,
      bankAccountNumber: this._bankAccountNumber,
      stripeAccountId: this._stripeAccountId,
      defaultCommissionPercentage: this._defaultCommissionPercentage,
      status: this._status,
      notes: this._notes,
      metadata: this._metadata,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
