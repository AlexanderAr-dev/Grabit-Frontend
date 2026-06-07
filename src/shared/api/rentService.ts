import { AxiosResponse } from 'axios';

import { CardPreview, IRentalDetail, IRentalItem } from '../types';
import {
  BackendCategory,
  BackendListing,
  BackendPaginatedResponse,
  mapListing,
  mapListingDetail,
  mapListingToCard,
} from './adapters';
import { api } from './instance';

interface CreateListingRequest {
  title: string;
  description: string;
  category_id: number;
  price_per_hour: number;
  quantity: number;
  buffer_hours: number;
  lat?: number;
  lon?: number;
  address?: string;
  attributes: { key: string; value: string }[];
}

interface UpdateListingData {
  title?: string;
  description?: string;
  category_id?: number;
  price_per_hour?: number;
  quantity?: number;
  buffer_hours?: number;
  lat?: number;
  lon?: number;
  address?: string;
  attributes?: { key: string; value: string }[];
}

interface AvailabilityPeriod {
  valid_from: string;
  valid_until: string;
  weekday_hours: Record<string, number[]>;
}

interface ListingsParams {
  query?: string;
  category_id?: number;
  lat?: number;
  lon?: number;
  radius_km?: number;
  min_price?: number;
  max_price?: number;
  page?: number;
  page_size?: number;
  owner_id?: string;
}

interface MyListingsParams {
  status?: string;
  page?: number;
  page_size?: number;
}

interface MediaResp {
  media_id: string;
  media_type: string;
  sort_order: number;
  url: string;
}

interface ReorderItem {
  media_id: string;
  sort_order: number;
}

interface UploadPhotoReq {
  listingId: string;
  file: File;
  sort_order: number;
}

interface UploadVideoReq {
  listingId: string;
  file: File;
  sort_order: number;
}

export class rentService {
  static async createListing(req: CreateListingRequest): Promise<BackendListing> {
    const response = await api.post<{ data: BackendListing }>('/rent/listings', req);
    return response.data.data;
  }

  static async getRentList(params?: ListingsParams): Promise<{ items: IRentalItem[]; total: number }> {
    const response = await api.get<{ data: BackendPaginatedResponse<BackendListing> }>('/rent/listings', { params });
    const raw = response.data.data;
    return { items: raw.items.map(mapListing), total: raw.total };
  }

  static async getRentInfo(id: string): Promise<AxiosResponse<{ data: IRentalDetail }>> {
    const response = await api.get<{ data: BackendListing }>(`/rent/listings/${id}`);
    const adapted: AxiosResponse<{ data: IRentalDetail }> = {
      ...response,
      data: { data: mapListingDetail(response.data.data) },
    };
    return adapted;
  }

  static async getUserListings(userId: string, params?: { page?: number; page_size?: number }): Promise<{ items: IRentalItem[]; total: number }> {
    return rentService.getRentList({ owner_id: userId, ...params });
  }

  static async getMyListings(params?: MyListingsParams): Promise<{ items: CardPreview[]; total: number }> {
    const response = await api.get<{ data: BackendPaginatedResponse<BackendListing> }>('/rent/listings/my', { params });
    const raw = response.data.data;
    return { items: raw.items.map(mapListingToCard), total: raw.total };
  }

  static async getCategories(): Promise<BackendCategory[]> {
    const response = await api.get<{ data: { categories: BackendCategory[] } }>('/rent/categories');
    return response.data.data.categories;
  }

  static async getAvailableSlots({ listingId, date }: { listingId: string; date: string }): Promise<{ available_hours: number[]; date: string }> {
    const response = await api.get<{ data: { available_hours: number[]; date: string } }>(`/rent/listings/${listingId}/slots`, { params: { date } });
    return response.data.data;
  }

  static async updateListing(id: string, data: UpdateListingData): Promise<IRentalDetail> {
    const response = await api.put<{ data: BackendListing }>(`/rent/listings/${id}`, data);
    return mapListingDetail(response.data.data);
  }

  static async deleteListing(id: string): Promise<void> {
    await api.delete(`/rent/listings/${id}`);
  }

  static async pauseListing(id: string): Promise<void> {
    await api.post(`/rent/listings/${id}/pause`);
  }

  static async resumeListing(id: string): Promise<void> {
    await api.post(`/rent/listings/${id}/resume`);
  }

  static async setAvailability(id: string, periods: AvailabilityPeriod[]): Promise<void> {
    await api.put(`/rent/listings/${id}/availability`, { periods });
  }

  static async uploadPhoto({ listingId, file, sort_order }: UploadPhotoReq): Promise<MediaResp> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sort_order', String(sort_order));
    const response = await api.post<{ data: MediaResp }>(
      `/rent/listings/${listingId}/media/photo`,
      formData,
    );
    return response.data.data;
  }

  static async uploadVideo({ listingId, file, sort_order }: UploadVideoReq): Promise<MediaResp> {
    // Шаг 1: получить presigned URL
    const urlResp = await api.post<{ data: { upload_url: string; object_key: string } }>(
      `/rent/listings/${listingId}/media/video/upload-url`,
    );
    const { upload_url, object_key } = urlResp.data.data;

    // Шаг 2: загрузить файл напрямую в MinIO (без авторизации — подпись вшита в URL)
    const putRes = await fetch(upload_url, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type || 'video/mp4' },
    });
    if (!putRes.ok) throw new Error(`Video upload to storage failed: ${putRes.status}`);

    // Шаг 3: подтвердить загрузку
    const confirmResp = await api.post<{ data: MediaResp }>(
      `/rent/listings/${listingId}/media/video/confirm`,
      { object_key, sort_order },
    );
    return confirmResp.data.data;
  }

  static async reorderPhotos({ listingId, items }: { listingId: string; items: ReorderItem[] }): Promise<void> {
    await api.put(`/rent/listings/${listingId}/media/photo/reorder`, items);
  }

  static async reorderVideos({ listingId, items }: { listingId: string; items: ReorderItem[] }): Promise<void> {
    await api.put(`/rent/listings/${listingId}/media/video/reorder`, items);
  }

  static async deleteMedia(listingId: string, mediaId: string): Promise<void> {
    await api.delete(`/rent/listings/${listingId}/media/${mediaId}`);
  }
}
