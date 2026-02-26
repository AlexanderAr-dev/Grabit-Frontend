import { api } from '@api/instance.ts';
import { IRentalItem } from '@app-types';
import { IRentalDetail } from '@app-types/IRentalDetail.ts';
import { AxiosResponse } from 'axios';

export class rentService {
  static async getRentLIst(
    page: number,
    limit: number,
    category: string,
    sort: string,
  ): Promise<
    AxiosResponse<
      { data: IRentalItem[] } & { message: string }
    >
  > {
    const response = await api.get(
      `/rentlist?page=${page}&limit=${limit}&category=${category}&sort=${sort}`,
    );
    console.log(response.data);
    return response;
  }

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
