import { httpClient } from './httpClient';

export interface CalendarEventItem {
  id: string;
  title: string;
  start: string;
  type: 'event' | 'booking' | 'hall_booking';
  status: string;
  color: string;
  extendedProps: {
    description?: string;
    client?: string;
    hall?: string;
    startTime?: string;
    endTime?: string;
    expectedGuests?: number;
    guestsCount?: number;
    amount?: number;
  };
}

export const calendarApi = {
  getEvents: async (start: string, end: string): Promise<CalendarEventItem[]> => {
    return httpClient.get<CalendarEventItem[]>('/calendar', { start, end });
  },
};
