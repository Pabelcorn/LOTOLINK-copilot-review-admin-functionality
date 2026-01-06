import { UserDevice } from '../entities/user-device.entity';

export interface UserDeviceRepository {
  create(device: UserDevice): Promise<UserDevice>;
  update(id: string, updates: Partial<UserDevice>): Promise<UserDevice | null>;
  findByToken(fcmToken: string): Promise<UserDevice | null>;
  findActiveByUserId(userId: string): Promise<UserDevice[]>;
  deactivate(id: string): Promise<void>;
}

export const USER_DEVICE_REPOSITORY = Symbol('UserDeviceRepository');
