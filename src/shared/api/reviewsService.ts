import { IReview } from '../types/IReview';
import { BackendPaginatedResponse, BackendReview, mapReview } from './adapters';
import { api } from './instance';

export interface ReviewsPage {
  items: IReview[];
  total: number;
}

export class reviewsService {
  static async getReviewsByRentalId(listingId: string, page = 1, pageSize = 20): Promise<ReviewsPage> {
    const response = await api.get<{ data: BackendPaginatedResponse<BackendReview> }>(
      `/rent/listings/${listingId}/reviews`,
      { params: { page, page_size: pageSize } },
    );
    return {
      items: response.data.data.items.map(mapReview),
      total: response.data.data.total,
    };
  }

  static async getReviewsByUserId(userId: string, page = 1, pageSize = 20): Promise<ReviewsPage> {
    const response = await api.get<{ data: BackendPaginatedResponse<BackendReview> }>(
      `/rent/users/${userId}/reviews`,
      { params: { page, page_size: pageSize } },
    );
    return {
      items: response.data.data.items.map(mapReview),
      total: response.data.data.total,
    };
  }

  static async createReview(
    bookingId: string,
    reviewType: 'renter_to_listing' | 'owner_to_renter',
    rating: number,
    comment: string,
  ): Promise<IReview> {
    const response = await api.post<{ data: BackendReview }>(
      `/rent/bookings/${bookingId}/reviews`,
      { review_type: reviewType, rating, comment },
    );
    return mapReview(response.data.data);
  }
}
