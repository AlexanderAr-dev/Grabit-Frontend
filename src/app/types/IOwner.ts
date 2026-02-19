import { IMediaType } from '@app-types/IMediaType.ts';

export interface IOwner {
  id: number;
  name: string;
  rating: number;
  reviewCount: number;
  avatar: IMediaType;
}
