import { v4 as uuidv4 } from 'uuid';

export interface TicketConfig {
  headerLogo?: string;
  headerText?: string;
  footerText?: string;
  showBarcode: boolean;
  showQR: boolean;
  validityDays: number;
  paperWidth?: number;
  fontSize?: number;
  customFields?: Record<string, string>;
}

export interface SucursalProps {
  id?: string;
  bancaId: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  province?: string;
  phone?: string;
  operatorPrefix?: string;
  isActive?: boolean;
  ticketConfig?: TicketConfig;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Sucursal {
  readonly id: string;
  readonly bancaId: string;
  readonly name: string;
  readonly code: string;
  private _address?: string;
  private _city?: string;
  private _province?: string;
  private _phone?: string;
  private _operatorPrefix?: string;
  private _isActive: boolean;
  private _ticketConfig: TicketConfig;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: SucursalProps) {
    this.id = props.id || uuidv4();
    this.bancaId = props.bancaId;
    this.name = props.name;
    this.code = props.code;
    this._address = props.address;
    this._city = props.city;
    this._province = props.province;
    this._phone = props.phone;
    this._operatorPrefix = props.operatorPrefix;
    this._isActive = props.isActive !== undefined ? props.isActive : true;
    this._ticketConfig = props.ticketConfig || {
      showBarcode: true,
      showQR: false,
      validityDays: 60,
    };
    this.createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // Getters
  get address(): string | undefined { return this._address; }
  get city(): string | undefined { return this._city; }
  get province(): string | undefined { return this._province; }
  get phone(): string | undefined { return this._phone; }
  get operatorPrefix(): string | undefined { return this._operatorPrefix; }
  get isActive(): boolean { return this._isActive; }
  get ticketConfig(): TicketConfig { return this._ticketConfig; }
  get updatedAt(): Date { return this._updatedAt; }

  // Methods
  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  updateTicketConfig(config: Partial<TicketConfig>): void {
    this._ticketConfig = { ...this._ticketConfig, ...config };
    this._updatedAt = new Date();
  }

  updateContactInfo(address?: string, city?: string, province?: string, phone?: string): void {
    if (address) this._address = address;
    if (city) this._city = city;
    if (province) this._province = province;
    if (phone) this._phone = phone;
    this._updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      bancaId: this.bancaId,
      name: this.name,
      code: this.code,
      address: this._address,
      city: this._city,
      province: this._province,
      phone: this._phone,
      operatorPrefix: this._operatorPrefix,
      isActive: this._isActive,
      ticketConfig: this._ticketConfig,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
