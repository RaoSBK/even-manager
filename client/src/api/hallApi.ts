import { httpClient } from './httpClient';

export interface HallAvailabilityResponse {
  date: string;
  halls: Array<{
    id: string;
    name: string;
    hallCode: string;
    description: string | null;
    location: string | null;
    capacity: number | null;
    basePrice: number;
    status: string;
    available: boolean;
  }>;
}

export const hallApi = {
  checkAvailability: async (
    date: string,
    startTime?: string,
    endTime?: string
  ): Promise<HallAvailabilityResponse> => {
    return httpClient.get<HallAvailabilityResponse>('/halls/availability', {
      date,
      startTime,
      endTime,
    });
  },
};
