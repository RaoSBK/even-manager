import { httpClient } from './httpClient';

export interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalCustomers: number;
  totalEmployees: number;
  totalVendors: number;
  availableHalls: number;
  occupiedHalls: number;
  pendingPayments: number;
  totalRevenue: number;
}

export const reportApi = {
  getOverview: async (): Promise<DashboardStats> => {
    return httpClient.get<DashboardStats>('/reports/overview');
  },
};
