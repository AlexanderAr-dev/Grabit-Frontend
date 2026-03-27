import { ICategory } from './ICategory';

export interface CardPreview {
  id?: string | number;
  title: string;
  price: number;
  priceUnit: string;
  location: string;
  rating: number;
  reviewCount?: number;
  shortDescription?: string;
  createdAt: string;
  category?: ICategory;
  previewImage?: string;
}

export interface CardDetails extends CardPreview {}
