// services/AuthService.ts
import { api } from '@api/instance.ts';
import { AxiosResponse } from 'axios';

export class AuthService {
  static async login(
    email: string,
    password: string,
  ): Promise<AxiosResponse<{ message: string }>> {
    console.log('Login attempt:', { email, password });
    return api.post('/login', { email, password });
  }

  static async register(
    login: string,
    email: string,
    password: string,
    language: string = 'ru',
  ): Promise<AxiosResponse<{ message: string }>> {
    console.log('Register attempt:', { login, email, password, language });
    return api.post('/register', {
      login,
      email,
      password,
      language,
    });
  }

  static async logout(): Promise<
    AxiosResponse<{ message: string }>
  > {
    return api.post('/logout');
  }
}