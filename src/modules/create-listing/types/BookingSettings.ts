export type WeekDay =
  | 'mon'
  | 'tue'
  | 'wed'
  | 'thu'
  | 'fri'
  | 'sat'
  | 'sun';

export interface DaySchedule {
  day: WeekDay;
  hours: boolean[]; // 24 часа
  minDuration: number; // минимум часов аренды
}

export interface BookingSettings {
  startDate: Date;
  endDate: Date;

  enabledDays: WeekDay[];

  schedule: DaySchedule[];
}
