import { BancaOwner, BancaOwnerStatus } from '../entities/banca-owner.entity';

export interface BancaOwnerRepository {
  save(owner: BancaOwner): Promise<BancaOwner>;
  findById(id: string): Promise<BancaOwner | null>;
  findByEmail(email: string): Promise<BancaOwner | null>;
  findByCedula(cedula: string): Promise<BancaOwner | null>;
  findByRnc(rnc: string): Promise<BancaOwner | null>;
  findByStatus(status: BancaOwnerStatus): Promise<BancaOwner[]>;
  findAll(): Promise<BancaOwner[]>;
  update(owner: BancaOwner): Promise<BancaOwner>;
}

export const BANCA_OWNER_REPOSITORY = Symbol('BancaOwnerRepository');
