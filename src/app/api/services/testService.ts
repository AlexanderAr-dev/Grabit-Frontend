import { api } from '@api/instance.ts';
import { IServerResult } from '@app-types';
import { IRentalDetail } from '@app-types/IRentalDetail.ts';

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
