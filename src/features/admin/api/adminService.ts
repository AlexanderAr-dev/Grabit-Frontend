import axios from 'axios';

const ADMIN_BASE = (import.meta.env.VITE_API_URL ?? 'https://grabit.test/api/v1/web').replace(
  '/web',
  '/admin',
);

export const adminApi = axios.create({
  withCredentials: true,
  baseURL: ADMIN_BASE,
});

export interface AdminUser {
  id: string;
  keycloak_id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_complete: boolean;
  blocked: boolean;
  created_at: string;
  deleted_at?: string;
  blocked_at?: string;
}

export interface AdminListing {
  listing_id: string;
  owner_id: string;
  title: string;
  price_per_hour: number;
  status: 'active' | 'paused' | 'deleted';
  avg_rating: number;
  review_count: number;
  created_at: string;
}

export interface AdminBooking {
  booking_id: string;
  listing: { listing_id: string; title?: string };
  renter_id: string;
  status:
    | 'pending'
    | 'approved'
    | 'active'
    | 'completed'
    | 'cancelled'
    | 'rejected'
    | 'no_show';
  total_price: number;
  start_time: string;
  end_time: string;
  created_at: string | { seconds: number; nanos: number };
}

export interface AdminReview {
  id: string;
  booking_id: string;
  listing_id: string;
  author_id: string;
  review_type: 'renter_to_listing' | 'renter_to_owner' | 'owner_to_renter';
  rating: number;
  comment: string;
  created_at: string;
}

export interface AdminCategory {
  id: number;
  parent_id?: number;
  name_ru: string;
  name_en: string;
  slug: string;
  sort_order: number;
  listing_count: number;
}

export interface AdminStats {
  total_users: number;
  new_users_7d: number;
  blocked_users: number;
  deleted_users: number;
  listings_by_status: { active: number; paused: number; deleted: number };
  bookings_by_status: {
    pending: number;
    approved: number;
    active: number;
    completed: number;
    cancelled: number;
  };
  total_revenue: number;
  total_reviews: number;
}

export interface PagedResult<T> {
  data: T[];
  total: number;
}

function extractTotal(header: string | null): number {
  if (!header) return 0;
  const match = header.match(/\/(\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
}

export const AdminService = {
  async getUsers(start: number, end: number): Promise<PagedResult<AdminUser>> {
    const res = await adminApi.get<AdminUser[]>('/users', { params: { _start: start, _end: end } });
    return { data: res.data, total: extractTotal(res.headers['content-range']) };
  },

  async blockUser(id: string): Promise<void> {
    await adminApi.put(`/users/${id}/block`);
  },

  async unblockUser(id: string): Promise<void> {
    await adminApi.put(`/users/${id}/unblock`);
  },

  async setPremium(
    id: string,
    plan: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'free',
  ): Promise<void> {
    await adminApi.put(`/users/${id}/premium`, { plan });
  },

  async getListings(start: number, end: number): Promise<PagedResult<AdminListing>> {
    const res = await adminApi.get<AdminListing[]>('/listings', { params: { _start: start, _end: end } });
    return { data: res.data, total: extractTotal(res.headers['content-range']) };
  },

  async deleteListing(id: string): Promise<void> {
    await adminApi.delete(`/listings/${id}`);
  },

  async getBookings(
    start: number,
    end: number,
    status?: string,
  ): Promise<PagedResult<AdminBooking>> {
    const res = await adminApi.get<AdminBooking[]>('/bookings', {
      params: { _start: start, _end: end, ...(status ? { status } : {}) },
    });
    return { data: res.data, total: extractTotal(res.headers['content-range']) };
  },

  async getReviews(start: number, end: number): Promise<PagedResult<AdminReview>> {
    const res = await adminApi.get<AdminReview[]>('/reviews', { params: { _start: start, _end: end } });
    return { data: res.data, total: extractTotal(res.headers['content-range']) };
  },

  async deleteReview(id: string): Promise<void> {
    await adminApi.delete(`/reviews/${id}`);
  },

  async getCategories(): Promise<AdminCategory[]> {
    const res = await adminApi.get<AdminCategory[]>('/categories');
    return res.data;
  },

  async createCategory(data: {
    name_ru: string;
    name_en: string;
    parent_id?: number;
    sort_order?: number;
  }): Promise<AdminCategory> {
    const res = await adminApi.post<AdminCategory>('/categories', data);
    return res.data;
  },

  async updateCategory(
    id: number,
    data: { name_ru: string; name_en: string },
  ): Promise<AdminCategory> {
    const res = await adminApi.put<AdminCategory>(`/categories/${id}`, data);
    return res.data;
  },

  async migrateCategory(id: number, to_id: number): Promise<{ migrated_count: number }> {
    const res = await adminApi.post<{ migrated_count: number }>(`/categories/${id}/migrate`, { to_id });
    return res.data;
  },

  async getStats(): Promise<AdminStats> {
    const res = await adminApi.get<AdminStats>('/stats');
    return res.data;
  },
};
