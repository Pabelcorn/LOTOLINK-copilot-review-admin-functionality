import { v4 as uuidv4 } from 'uuid';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface UserProps {
  id?: string;
  phone: string;
  email?: string;
  name?: string;
  password?: string;
  role?: UserRole;
  walletBalance?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  readonly id: string;
  readonly phone: string;
  private _email?: string;
  private _name?: string;
  private _password?: string;
  private _role: UserRole;
  private _walletBalance: number;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id || uuidv4();
    this.phone = props.phone;
    this._email = props.email;
    this._name = props.name;
    this._password = props.password;
    this._role = props.role || UserRole.USER;
    this._walletBalance = props.walletBalance || 0;
    this.createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  get email(): string | undefined {
    return this._email;
  }

  get name(): string | undefined {
    return this._name;
  }

  get password(): string | undefined {
    return this._password;
  }

  get role(): UserRole {
    return this._role;
  }

  get walletBalance(): number {
    return this._walletBalance;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get isAdmin(): boolean {
    return this._role === UserRole.ADMIN;
  }

  updateProfile(name?: string, email?: string): void {
    if (name) this._name = name;
    if (email) this._email = email;
    this._updatedAt = new Date();
  }

  setPassword(hashedPassword: string): void {
    this._password = hashedPassword;
    this._updatedAt = new Date();
  }

  setRole(role: UserRole): void {
    this._role = role;
    this._updatedAt = new Date();
  }

  chargeWallet(amount: number): void {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
    this._walletBalance += amount;
    this._updatedAt = new Date();
  }

  debitWallet(amount: number): void {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
    if (this._walletBalance < amount) {
      throw new Error('Insufficient wallet balance');
    }
    this._walletBalance -= amount;
    this._updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      phone: this.phone,
      email: this._email,
      name: this._name,
      role: this._role,
      isAdmin: this.isAdmin,
      walletBalance: this._walletBalance,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
