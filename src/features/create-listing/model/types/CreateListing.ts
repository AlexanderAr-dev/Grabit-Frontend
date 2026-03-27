export type ListingType = 'item_rent';

export type WeekDay =
  | 'mon'
  | 'tue'
  | 'wed'
  | 'thu'
  | 'fri'
  | 'sat'
  | 'sun';

export interface BookingDateRange {
  start: Date;
  end: Date;
}

export interface ListingOption {
  key: string;
  label: string;
  value: number;
}

export interface DaySchedule {
  day: WeekDay;
  hours: boolean[];
  minDuration: number;
}

export interface BookingSettings {
  range?: BookingDateRange;
  enabledDays?: WeekDay[];
  schedule?: DaySchedule[];
}

export interface CreateListingData {
  type: ListingType;
  categoryId?: string;
  title?: string;
  description?: string;
  features?: string[];
  options?: ListingOption[];
  pricePerDay?: number;
  location?: { lat: number; lng: number };
  booking?: BookingSettings;
}
