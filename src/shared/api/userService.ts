import { AxiosResponse } from 'axios';

import { IUserInfo } from '../types/IUserInfo';
import { api } from './instance';

export class UserService {
  static async infoUser(): Promise<
    AxiosResponse<{ data: IUserInfo } & { message: string }>
  > {
    return api.get('/user');
  }
}
