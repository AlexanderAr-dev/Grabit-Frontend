import { API_URL, api } from './instance';

export class AuthService {
  static getSsoLoginUrl(): string {
    return `${API_URL}/sso/login`;
  }

  static getSsoRegisterUrl(): string {
    return `${API_URL}/sso/register`;
  }

  static async logout(): Promise<string | null> {
    const res = await api.post<{ data: { logout_url: string } }>('/sso/logout');
    return res.data?.data?.logout_url ?? null;
  }
}
