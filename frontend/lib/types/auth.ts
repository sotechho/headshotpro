export interface User {
  id: string;
  username?: string;
  email: string;
  isActive: boolean;
  credits: number;
  role: string;
  emailVerified: boolean;
}

export interface RegisterInput {
  username?: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: User;
}
