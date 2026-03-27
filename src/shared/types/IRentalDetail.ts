import { IMediaType } from './IMediaType';
import { IOwner } from './IOwner';
import { IRentalItem } from './IRentalItem';

export interface IRentalDetail extends IRentalItem {
  media?: IMediaType[];
  renter: IOwner;
  bookingCalendar: string;
  reviews: number;
}
