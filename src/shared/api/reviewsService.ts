import { AxiosResponse } from 'axios';

import { IReview } from '../types/IReview';
import { api } from './instance';

export class reviewsService {
  static async getReviewsByRentalId(
    productId: number,
  ): Promise<AxiosResponse<{ data: IReview[] } & { message: string }>> {
    return api.get(`/review/product-id=${productId}`);
  }

  static async getReviewsByOwnerId(
    ownerId: number,
  ): Promise<AxiosResponse<{ data: IReview[] } & { message: string }>> {
    return api.get(`/review/owner-id=${ownerId}`);
  }

  static async createReview(
    rentalId: number,
    ownerId: number,
    text: string,
    rating: number,
    userId: number,
  ): Promise<AxiosResponse<{ message: string }>> {
    return api.post('/createReview', {
      rentalId,
      ownerId,
      text,
      rating,
      userId,
    });
  }

  static async updateReview(
    reviewId: number,
    text?: string,
    rating?: number,
  ): Promise<AxiosResponse<{ message: string }>> {
    return api.post('/updateReview', {
      reviewId,
      text,
      rating,
    });
  }

  static async deleteReview(
    reviewId: number,
  ): Promise<AxiosResponse<{ message: string }>> {
    return api.delete(`/review/${reviewId}`);
  }
}
