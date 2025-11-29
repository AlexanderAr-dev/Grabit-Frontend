import { ICardPreview, IProvider } from '@app-types';

export interface ICardDetails extends ICardPreview {
  fullDescription: string;
  images: string[];
  address: string;
  provider: IProvider; // иначе арендодатель
}
