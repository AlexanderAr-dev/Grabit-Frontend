import { api } from '@api/instance.ts';
import { IUser } from '@app-types/IUser';
import { AxiosResponse } from 'axios';

export class UserService {
  static async infoUser(): Promise<
    AxiosResponse<{ data: IUser } & { message: string }>
  > {
    return api.get('/user');
  }
}
