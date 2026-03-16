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

  /** 24 часа доступности */
  hours: boolean[];

  /** минимальное время аренды */
  minDuration: number;
}

export interface BookingSettings {
  /** общий период аренды */
  range?: BookingDateRange;

  /** разрешённые дни недели */
  enabledDays?: WeekDay[];

  /** расписание по дням */
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

  location?: {
    lat: number;
    lng: number;
  };

  booking?: BookingSettings;
}