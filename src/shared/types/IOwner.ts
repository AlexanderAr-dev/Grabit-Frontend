import { IMediaType } from './IMediaType';

export interface IOwner {
  id: number;
  name: string;
  rating: number;
  reviewCount: number;
  avatar: IMediaType;
}
