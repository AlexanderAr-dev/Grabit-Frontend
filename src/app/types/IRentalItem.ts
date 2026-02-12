import { ICategory, IMediaType, IPriceInfo } from '@app-types/index.ts';

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
