export type ListingType = 'item_rent' | 'service' | 'space';

export type WeekDay =
  | 'mon'
  | 'tue'
  | 'wed'
  | 'thu'
  | 'fri'
  | 'sat'
  | 'sun';

export interface BookingDateRange {
  start: string; // YYYY-MM-DD
  end: string;
}

export interface Characteristic {
  label: string;
  value: string;
}

export interface SpaceDetails {
  bathrooms?: number;
  sleepingPlaces?: number;
  hasSauna?: boolean;
}

export interface DaySchedule {
  day: WeekDay;
  hours: boolean[];
  minDuration: number;
}

export interface BookingSettings {
  availabilityRange?: BookingDateRange;
  autoRenewal?: boolean;
  enabledDays?: WeekDay[];
  schedule?: DaySchedule[];
}

export interface CreateListingData {
  type: ListingType;
  title?: string;
  description?: string;
  pricePerHour?: number;
  characteristics?: Characteristic[];
  spaceDetails?: SpaceDetails;
  location?: { lat: number; lng: number };
  booking?: BookingSettings;
}
