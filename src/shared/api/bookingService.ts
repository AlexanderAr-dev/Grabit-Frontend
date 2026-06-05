import { BackendPaginatedResponse } from './adapters';
import { api } from './instance';

interface CreateBookingParams {
  listing_id: string;
  quantity: number;
  start_time: string;
  end_time: string;
}

// Одиночное бронирование (create/approve/reject/cancel/extend)
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

// Встроенная информация об объявлении в списочных эндпоинтах
export interface BookingListingInfo {
  listing_id: string;
  owner_id: string;
  title: string;
  price_per_hour: number;
  address?: string;
  status: string;
  avg_rating: number;
  review_count: number;
  cover_url?: string;
}

// Элемент списка бронирований (as-renter / as-owner)
export interface BookingListItem {
  booking_id: string;
  renter_id: string;
  quantity: number;
  start_time: string;
  end_time: string;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'rejected' | 'cancelled';
  total_price: number;
  created_at: string;
  updated_at: string;
  listing: BookingListingInfo;
}

interface BookingsPage {
  items: BookingItem[];
  total: number;
}

interface BookingsListPage {
  items: BookingListItem[];
  total: number;
  page: number;
  page_size: number;
}

interface BookingsListParams {
  status?: string;
  page?: number;
  pageSize?: number;
}

export class bookingService {
  static async createBooking(params: CreateBookingParams): Promise<BookingItem> {
    const response = await api.post<{ data: BookingItem }>('/rent/bookings', params);
    return response.data.data;
  }

  // Мои бронирования как арендатор (с встроенной инфо об объявлении)
  static async getAsRenter({ status, page, pageSize }: BookingsListParams = {}): Promise<BookingsListPage> {
    const response = await api.get<{ data: BookingsListPage }>(
      '/rent/bookings/as-renter',
      { params: { status, page, page_size: pageSize } },
    );
    return response.data.data;
  }

  // Бронирования моих объявлений как владелец (с встроенной инфо об объявлении)
  static async getAsOwner({ status, page, pageSize }: BookingsListParams = {}): Promise<BookingsListPage> {
    const response = await api.get<{ data: BookingsListPage }>(
      '/rent/bookings/as-owner',
      { params: { status, page, page_size: pageSize } },
    );
    return response.data.data;
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

  static async extendBooking({ id, newEndTime }: { id: string; newEndTime: string }): Promise<BookingItem> {
    const response = await api.post<{ data: BookingItem }>(`/rent/bookings/${id}/extend`, { new_end_time: newEndTime });
    return response.data.data;
  }
}
