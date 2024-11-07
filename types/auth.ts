import { Role } from '@/types/user';

export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  roles?: Role[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
}