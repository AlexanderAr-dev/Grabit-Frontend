import { ICategory } from './ICategory';
import { IMediaType } from './IMediaType';
import { IPriceInfo } from './IPriceInfo';

export type ProductType = 'product' | 'space' | 'service';

export interface IRentalItem {
  id: string;
  title: string;
  cost: IPriceInfo;
  category: ICategory;
  productType: ProductType | null;
  address: string;
  rating: number | null;
  reviewCount: number | null;
  previewImage?: IMediaType;
  description?: string;
  createdDate: string;
  quantity?: number;
  status?: string;
  lat?: number;
  lon?: number;
  ownerIsPremium?: boolean;
  availableFrom?: string | null;
  availableUntil?: string | null;
}
