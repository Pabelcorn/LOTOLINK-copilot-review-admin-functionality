import { v4 as uuidv4 } from 'uuid';

export enum IntegrationType {
  API = 'api',
  WHITE_LABEL = 'white_label',
  MIDDLEWARE = 'middleware',
}

export enum AuthType {
  OAUTH2 = 'oauth2',
  HMAC = 'hmac',
  MTLS = 'mtls',
  NONE = 'none',
}

export enum BancaStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

export interface BancaProps {
  id?: string;
  name: string;
  integrationType: IntegrationType;
  endpoint?: string;
  authType: AuthType;
  clientId?: string;
  secret?: string;
  publicKey?: string;
  slaMs?: number;
  isActive?: boolean;
  rnc?: string;
  address?: string;
  phone?: string;
  email?: string;
  status?: BancaStatus;
  // Bank account configuration
  commissionPercentage?: number;
  commissionStripeAccountId?: string;
  cardProcessingAccountId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Banca {
  readonly id: string;
  readonly name: string;
  readonly integrationType: IntegrationType;
  private _endpoint?: string;
  readonly authType: AuthType;
  private _clientId?: string;
  private _secret?: string;
  private _publicKey?: string;
  private _slaMs: number;
  private _isActive: boolean;
  private _rnc?: string;
  private _address?: string;
  private _phone?: string;
  private _email?: string;
  private _status: BancaStatus;
  private _commissionPercentage?: number;
  private _commissionStripeAccountId?: string;
  private _cardProcessingAccountId?: string;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: BancaProps) {
    this.id = props.id || uuidv4();
    this.name = props.name;
    this.integrationType = props.integrationType;
    this._endpoint = props.endpoint;
    this.authType = props.authType;
    this._clientId = props.clientId;
    this._secret = props.secret;
    this._publicKey = props.publicKey;
    this._slaMs = props.slaMs || 5000;
    this._isActive = props.isActive !== undefined ? props.isActive : true;
    this._rnc = props.rnc;
    this._address = props.address;
    this._phone = props.phone;
    this._email = props.email;
    this._status = props.status || BancaStatus.PENDING;
    this._commissionPercentage = props.commissionPercentage;
    this._commissionStripeAccountId = props.commissionStripeAccountId;
    this._cardProcessingAccountId = props.cardProcessingAccountId;
    this.createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  get endpoint(): string | undefined {
    return this._endpoint;
  }

  get clientId(): string | undefined {
    return this._clientId;
  }

  get secret(): string | undefined {
    return this._secret;
  }

  get publicKey(): string | undefined {
    return this._publicKey;
  }

  get slaMs(): number {
    return this._slaMs;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get rnc(): string | undefined {
    return this._rnc;
  }

  get address(): string | undefined {
    return this._address;
  }

  get phone(): string | undefined {
    return this._phone;
  }

  get email(): string | undefined {
    return this._email;
  }

  get status(): BancaStatus {
    return this._status;
  }

  get commissionPercentage(): number | undefined {
    return this._commissionPercentage;
  }

  get commissionStripeAccountId(): string | undefined {
    return this._commissionStripeAccountId;
  }

  get cardProcessingAccountId(): string | undefined {
    return this._cardProcessingAccountId;
  }

  updateEndpoint(endpoint: string): void {
    this._endpoint = endpoint;
    this._updatedAt = new Date();
  }

  updateContactInfo(rnc?: string, address?: string, phone?: string, email?: string): void {
    if (rnc) this._rnc = rnc;
    if (address) this._address = address;
    if (phone) this._phone = phone;
    if (email) this._email = email;
    this._updatedAt = new Date();
  }

  updateBankAccountSettings(
    commissionPercentage?: number,
    commissionStripeAccountId?: string,
    cardProcessingAccountId?: string
  ): void {
    if (commissionPercentage !== undefined) this._commissionPercentage = commissionPercentage;
    if (commissionStripeAccountId !== undefined) this._commissionStripeAccountId = commissionStripeAccountId;
    if (cardProcessingAccountId !== undefined) this._cardProcessingAccountId = cardProcessingAccountId;
    this._updatedAt = new Date();
  }

  approve(): void {
    this._status = BancaStatus.APPROVED;
    this._updatedAt = new Date();
  }

  reject(): void {
    this._status = BancaStatus.REJECTED;
    this._isActive = false;
    this._updatedAt = new Date();
  }

  suspend(): void {
    this._status = BancaStatus.SUSPENDED;
    this._isActive = false;
    this._updatedAt = new Date();
  }

  activateAfterApproval(): void {
    if (this._status === BancaStatus.APPROVED) {
      this._status = BancaStatus.ACTIVE;
      this._isActive = true;
      this._updatedAt = new Date();
    }
  }

  updateCredentials(clientId?: string, secret?: string, publicKey?: string): void {
    if (clientId) this._clientId = clientId;
    if (secret) this._secret = secret;
    if (publicKey) this._publicKey = publicKey;
    this._updatedAt = new Date();
  }

  activate(): void {
    this._isActive = true;
    this._status = BancaStatus.ACTIVE;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      integrationType: this.integrationType,
      endpoint: this._endpoint,
      authType: this.authType,
      slaMs: this._slaMs,
      isActive: this._isActive,
      rnc: this._rnc,
      address: this._address,
      phone: this._phone,
      email: this._email,
      status: this._status,
      commissionPercentage: this._commissionPercentage,
      commissionStripeAccountId: this._commissionStripeAccountId,
      cardProcessingAccountId: this._cardProcessingAccountId,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
