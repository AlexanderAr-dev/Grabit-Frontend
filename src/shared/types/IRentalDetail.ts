import { IMediaType } from './IMediaType';
import { IOwner } from './IOwner';
import { IRentalItem } from './IRentalItem';

export type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface BookingDateRange {
  start: string; // YYYY-MM-DD
  end: string;
}

export interface DaySchedule {
  day: WeekDay;
  hours: boolean[];   // 24 элемента, true = час доступен
  minDuration: number;
}

export interface BookingSettings {
  availabilityRange?: BookingDateRange;
  autoRenewal?: boolean;
  enabledDays?: WeekDay[];
  schedule?: DaySchedule[];
}

export interface IRentalAttribute {
  key: string;
  value: string;
}

export interface IRentalDetail extends IRentalItem {
  media?: IMediaType[];
  renter?: IOwner;
  bookingCalendar: string;
  reviews: number;
  booking?: BookingSettings;
  coordinates?: string; // "lat,lng"
  ownerId?: string;
  attributes?: IRentalAttribute[];
  bufferHours?: number;
}
