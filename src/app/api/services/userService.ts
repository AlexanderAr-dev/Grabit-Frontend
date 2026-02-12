import { api } from '@api/instance.ts';
import { IUserInfo } from '@app-types/IUserInfo.ts';
import { AxiosResponse } from 'axios';

export class UserService {
  static async infoUser(): Promise<
    AxiosResponse<{ data: IUserInfo } & { message: string }>
  > {
    return api.get('/user');
  }
}
