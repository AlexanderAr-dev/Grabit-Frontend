import { ICategory } from './ICategory';
import { IMediaType } from './IMediaType';
import { IPriceInfo } from './IPriceInfo';

type ProductType = 'product' | 'space' | 'service';

export interface IRentalItem {
  id: number;
  title: string;
  cost: IPriceInfo;
  category: ICategory;
  productType: ProductType;
  address: string;
  rating: number | null;
  reviewCount: number | null;
  previewImage?: IMediaType;
  description?: string;
  createdDate: string;
}
