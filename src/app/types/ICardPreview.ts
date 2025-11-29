import { ICategory } from '@app-types';

export interface ICardPreview {
  id: string;
  title: string;
  price: number;
  priceUnit: string; // "час", "день", "месяц"
  category: ICategory;
  location: string;
  rating: number;
  reviewCount?: number; // количество отзывов
  previewImage?: string;
  shortDescription?: string;
  createdAt: string;
}
