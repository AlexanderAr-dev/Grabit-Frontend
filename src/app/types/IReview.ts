import { IUserCard } from '@app-types/IUserCard.ts';

export interface IReview {
  id: number;
  adName: string;
  author: IUserCard;
  createdDate: string;
  text: string;
  rating: number;
}
