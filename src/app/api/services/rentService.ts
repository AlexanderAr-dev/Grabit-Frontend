import { api } from '@api/instance.ts';
import { IRentalDetail } from '@app-types/IRentalDetail.ts';
import { AxiosResponse } from 'axios';

export class rentService {
  static async getRentInfo(
    rentId: number,
  ): Promise<
    AxiosResponse<
      { data: IRentalDetail } & { message: string }
    >
  > {
    const response = await api.get(`/rent-info/${rentId}`);
    console.log(response);
    return response;
  }
}
