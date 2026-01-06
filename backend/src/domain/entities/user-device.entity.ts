import { v4 as uuidv4 } from 'uuid';

export type DeviceType = 'ios' | 'android' | 'web';

export interface UserDeviceProps {
  id?: string;
  userId: string;
  fcmToken: string;
  deviceType: DeviceType;
  deviceName?: string;
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
  isActive?: boolean;
  lastUsedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserDevice {
  readonly id: string;
  readonly userId: string;
  readonly fcmToken: string;
  readonly deviceType: DeviceType;
  readonly deviceName?: string;
  readonly deviceModel?: string;
  readonly osVersion?: string;
  readonly appVersion?: string;
  readonly isActive: boolean;
  readonly lastUsedAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: UserDeviceProps) {
    this.id = props.id || uuidv4();
    this.userId = props.userId;
    this.fcmToken = props.fcmToken;
    this.deviceType = props.deviceType;
    this.deviceName = props.deviceName;
    this.deviceModel = props.deviceModel;
    this.osVersion = props.osVersion;
    this.appVersion = props.appVersion;
    this.isActive = props.isActive ?? true;
    this.lastUsedAt = props.lastUsedAt;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  deactivate(): UserDevice {
    return new UserDevice({ ...this, isActive: false, updatedAt: new Date() });
  }

  updateLastUsed(): UserDevice {
    return new UserDevice({ ...this, lastUsedAt: new Date(), updatedAt: new Date() });
  }
}
