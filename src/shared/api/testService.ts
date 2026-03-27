import { IServerResult } from '../types/IServerResult';
import { IRentalDetail } from '../types/IRentalDetail';
import { api } from './instance';

export class testService {
  static async getRentInfo(
    rentId: number,
  ): Promise<IServerResult<IRentalDetail>> {
    const response = await api.get(`/rent-info/${rentId}`);

    return {
      data: response.data,
      message: 'mock success',
    };
  }
}
