import { IUserCard } from './IUserCard';

export interface IReview {
  id: number;
  adName: string;
  author: IUserCard;
  createdDate: string;
  text: string;
  rating: number;
}
