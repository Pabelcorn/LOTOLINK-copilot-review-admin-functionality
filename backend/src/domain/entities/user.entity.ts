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
  birthDate?: Date;
  ageVerified?: boolean;
  isGuest?: boolean;
  guestExpiresAt?: Date;
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
  private _birthDate?: Date;
  private _ageVerified: boolean;
  private _isGuest: boolean;
  private _guestExpiresAt?: Date;
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
    this._birthDate = props.birthDate;
    this._ageVerified = props.ageVerified || false;
    this._isGuest = props.isGuest || false;
    this._guestExpiresAt = props.guestExpiresAt;
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

  get birthDate(): Date | undefined {
    return this._birthDate;
  }

  get ageVerified(): boolean {
    return this._ageVerified;
  }

  get isGuest(): boolean {
    return this._isGuest;
  }

  get guestExpiresAt(): Date | undefined {
    return this._guestExpiresAt;
  }

  get age(): number | undefined {
    if (!this._birthDate) return undefined;
    const today = new Date();
    let age = today.getFullYear() - this._birthDate.getFullYear();
    const monthDiff = today.getMonth() - this._birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < this._birthDate.getDate())) {
      age--;
    }
    return age;
  }

  updateProfile(name?: string, email?: string): void {
    if (name) this._name = name;
    if (email) this._email = email;
    this._updatedAt = new Date();
  }

  verifyAge(birthDate: Date): boolean {
    this._birthDate = birthDate;
    const calculatedAge = this.age;
    if (calculatedAge && calculatedAge >= 18) {
      this._ageVerified = true;
      this._updatedAt = new Date();
      return true;
    }
    return false;
  }

  convertFromGuest(): void {
    if (this._isGuest) {
      this._isGuest = false;
      this._guestExpiresAt = undefined;
      this._updatedAt = new Date();
    }
  }

  isGuestExpired(): boolean {
    if (!this._isGuest || !this._guestExpiresAt) return false;
    return new Date() > this._guestExpiresAt;
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
      birthDate: this._birthDate,
      ageVerified: this._ageVerified,
      isGuest: this._isGuest,
      guestExpiresAt: this._guestExpiresAt,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
