import { IMediaType } from './IMediaType';

export interface IUserInfo {
  id: string;
  login: string;
  isVerified?: boolean | null;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  description?: string | null;
  phoneNumber?: string;
  avatar?: IMediaType;
  stats: {
    reviews: number;
    rating: number;
    offers?: number | null;
  };
  ratingAsOwner: number;
  ratingAsRenter: number;
  reviewCountAsOwner: number;
  reviewCountAsRenter: number;
  birthDate?: string;
  gender?: string;
  profileComplete?: boolean;
  language?: string | null;
  isPremium: boolean;
  subscriptionTier: 'free' | 'premium';
  subscriptionExpiresAt?: string;
}
