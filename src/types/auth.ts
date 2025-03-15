export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData extends LoginFormData {
  name: string;
  confirmPassword: string;
  region: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    region: string;
  };
} 