import { IUserCard } from './IUserCard';

export interface IReview {
  id: string;
  adName?: string | null;
  author: IUserCard;
  authorId: string;
  createdDate: string;
  text: string;
  rating: number;
  authorIsPremium?: boolean;
  listingId?: string;
}
