import {
  IMediaType,
  IOwner,
  IRentalItem,
} from '@app-types';

export interface IRentalDetail extends IRentalItem {
  media?: IMediaType[];
  renter: IOwner;
  bookingCalendar: string;
  reviews: number;
}
