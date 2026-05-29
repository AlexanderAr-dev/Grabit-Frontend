import { AxiosResponse } from 'axios';

import { IUserInfo } from '../types/IUserInfo';
import { BackendUserResponse, mapUser } from './adapters';
import { api } from './instance';

export interface IPublicProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  name: string;
  avatarUrl?: string;
  ratingAsOwner: number;
  reviewCountAsOwner: number;
  ratingAsRenter: number;
  reviewCountAsRenter: number;
  activeListingsCount: number;
  createdAt: string;
}

interface BackendPublicProfile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  avg_rating_as_owner: number;
  review_count_as_owner: number;
  avg_rating_as_renter: number;
  review_count_as_renter: number;
  active_listings_count: number;
  created_at: string;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  birth_date?: string;
  gender?: string;
}

export class UserService {
  static async infoUser(): Promise<AxiosResponse<{ data: IUserInfo }>> {
    const response = await api.get<{ data: BackendUserResponse }>('/users/me');
    const adapted: AxiosResponse<{ data: IUserInfo }> = {
      ...response,
      data: { data: mapUser(response.data.data) },
    };
    return adapted;
  }

  static async updateProfile(data: UpdateProfileData): Promise<IUserInfo> {
    const response = await api.patch<{ data: BackendUserResponse }>('/users/me', data);
    return mapUser(response.data.data);
  }

  static async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post<{ data: { avatar_url: string } }>('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data.avatar_url;
  }

  static async deleteAvatar(): Promise<void> {
    await api.delete('/users/me/avatar');
  }

  static async getPublicProfile(id: string): Promise<IPublicProfile> {
    const response = await api.get<{ data: BackendPublicProfile; ok: boolean }>(`/users/id/${id}`);
    const u = response.data.data;
    return {
      id: u.id,
      username: u.username,
      firstName: u.first_name,
      lastName: u.last_name,
      name: [u.first_name, u.last_name].filter(Boolean).join(' '),
      avatarUrl: u.avatar_url,
      ratingAsOwner: u.avg_rating_as_owner,
      reviewCountAsOwner: u.review_count_as_owner,
      ratingAsRenter: u.avg_rating_as_renter,
      reviewCountAsRenter: u.review_count_as_renter,
      activeListingsCount: u.active_listings_count,
      createdAt: u.created_at,
    };
  }

  static async getUserById(id: string): Promise<IPublicProfile> {
    return UserService.getPublicProfile(id);
  }
}
