import { IMediaType } from './IMediaType';

export interface IUserInfo {
  id: number;
  login: string;
  isVerified?: boolean;
  email: string;
  name: string;
  description: string;
  phoneNumber: string;
  avatar?: IMediaType;
  stats: {
    reviews: number;
    rating: number;
    offers: number;
  };
  language: string;
}
