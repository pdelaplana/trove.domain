export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export type OperatingHours = {
  day: DayOfWeek;
  isClosed: boolean;
  openAt?: string;
  closeAt?: string;
};

export const operatingHoursValidationSchema = {
  day: {
    required: 'Day is required',
  },
  openAt: {
    required: 'Open time is required',
  },
  closeAt: {
    required: 'Close time is required',
  },
};
