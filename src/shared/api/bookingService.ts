import { BackendPaginatedResponse } from './adapters';
import { api } from './instance';

interface CreateBookingParams {
  listing_id: string;
  quantity: number;
  start_time: string;
  end_time: string;
}

export interface BookingItem {
  booking_id: string;
  listing_id: string;
  renter_id: string;
  quantity: number;
  start_time: string;
  end_time: string;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'rejected' | 'cancelled';
  total_price: number;
  created_at: string;
  updated_at: string;
}

export type BookingResult = BookingItem;

interface BookingsPage {
  items: BookingItem[];
  total: number;
}

export class bookingService {
  static async createBooking(params: CreateBookingParams): Promise<BookingItem> {
    const response = await api.post<{ data: BookingItem }>('/rent/bookings', params);
    return response.data.data;
  }

  static async getMyBookings({
    status,
    page,
    pageSize,
  }: {
    status?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<BookingsPage> {
    const response = await api.get<{ data: BackendPaginatedResponse<BookingItem> }>(
      '/rent/bookings/my',
      { params: { status, page, page_size: pageSize } },
    );
    const raw = response.data.data;
    return { items: raw.items, total: raw.total };
  }

  static async getListingBookings({
    listingId,
    status,
    page,
    pageSize,
  }: {
    listingId: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<BookingsPage> {
    const response = await api.get<{ data: BackendPaginatedResponse<BookingItem> }>(
      `/rent/listings/${listingId}/bookings`,
      { params: { status, page, page_size: pageSize } },
    );
    const raw = response.data.data;
    return { items: raw.items, total: raw.total };
  }

  static async approveBooking(id: string): Promise<BookingItem> {
    const response = await api.post<{ data: BookingItem }>(`/rent/bookings/${id}/approve`);
    return response.data.data;
  }

  static async rejectBooking({ id, reason }: { id: string; reason?: string }): Promise<BookingItem> {
    const response = await api.post<{ data: BookingItem }>(`/rent/bookings/${id}/reject`, reason ? { reason } : {});
    return response.data.data;
  }

  static async cancelBooking({ id, reason }: { id: string; reason?: string }): Promise<BookingItem> {
    const response = await api.post<{ data: BookingItem }>(`/rent/bookings/${id}/cancel`, reason ? { reason } : {});
    return response.data.data;
  }
}
