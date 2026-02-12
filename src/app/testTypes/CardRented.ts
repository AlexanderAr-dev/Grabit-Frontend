import { RenterCard } from './RenterCard.ts';

export interface CardRented {
  id: number;
  renter: RenterCard;
  title: string;
  endTime: string;
  previewImage: string;
  createdDate: string;
}
