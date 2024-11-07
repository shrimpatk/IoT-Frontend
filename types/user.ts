export interface UserSettings {
  id: string;
  userId: string;
  receiveNotifications: boolean;
  receiveEmails: boolean;
  theme: 'light' | 'dark';
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
