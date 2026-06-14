import { BackendPaginatedResponse } from './adapters';
import { api } from './instance';

interface CreateBookingParams {
  listing_id: string;
  quantity: number;
  start_time: string;
  end_time: string;
}

export type BookingStatus = 'pending' | 'approved' | 'active' | 'completed' | 'rejected' | 'cancelled' | 'no_show';

export interface BookingExtension {
  id: string;
  booking_id: string;
  new_end_time: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

// Одиночное бронирование (create/get/approve/reject/cancel)
export interface BookingItem {
  booking_id: string;
  listing_id: string;
  renter_id: string;
  quantity: number;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  cancelled_by: 'owner' | 'renter' | 'system' | null;
  total_price: number;
  created_at: string;
  updated_at: string;
  pending_extension?: BookingExtension | null;
  renter_is_premium?: boolean;
  has_my_review: boolean;
}

export type BookingResult = BookingItem;

// Встроенная информация об объявлении в списочных эндпоинтах
export interface BookingListingInfo {
  listing_id: string;
  owner_id: string;
  title: string;
  price_per_hour: number;
  address: string | null;
  status: string;
  avg_rating: number;
  review_count: number;
  cover_url: string | null;
  owner_is_premium?: boolean;
}

// Элемент списка бронирований (as-renter / as-owner / listing bookings)
export interface BookingListItem {
  booking_id: string;
  renter_id: string;
  quantity: number;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  cancelled_by: 'owner' | 'renter' | 'system' | null;
  total_price: number;
  created_at: string;
  updated_at: string;
  listing: BookingListingInfo;
  renter_is_premium?: boolean;
  has_my_review: boolean;
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

  static async getBooking(id: string): Promise<BookingItem> {
    const response = await api.get<{ data: BookingItem }>(`/rent/bookings/${id}`);
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
  }): Promise<BookingsListPage> {
    const response = await api.get<{ data: BackendPaginatedResponse<BookingListItem> }>(
      `/rent/listings/${listingId}/bookings`,
      { params: { status, page, page_size: pageSize } },
    );
    const raw = response.data.data;
    return { items: raw.items, total: raw.total, page: raw.page, page_size: raw.page_size };
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

  // Запрос на продление (renter, только active)
  static async requestExtension({ id, newEndTime }: { id: string; newEndTime: string }): Promise<BookingExtension> {
    const response = await api.post<{ data: BookingExtension }>(`/rent/bookings/${id}/extension`, {
      new_end_time: newEndTime,
    });
    return response.data.data;
  }

  // Одобрить продление (owner, только active + pending extension)
  static async approveExtension(id: string): Promise<BookingItem> {
    const response = await api.post<{ data: BookingItem }>(`/rent/bookings/${id}/extension/approve`);
    return response.data.data;
  }

  // Отклонить продление (owner, только active + pending extension)
  static async rejectExtension(id: string): Promise<BookingExtension> {
    const response = await api.post<{ data: BookingExtension }>(`/rent/bookings/${id}/extension/reject`);
    return response.data.data;
  }

  // Отметить неявку (owner, только active, первые 60 минут)
  static async markNoShow(id: string): Promise<BookingItem> {
    const response = await api.post<{ data: BookingItem }>(`/rent/bookings/${id}/no-show`);
    return response.data.data;
  }
}
