import { httpClient } from './httpClient';
import { Customer } from './customerApi';
import { Employee } from './employeeApi';
import { EventDetails } from './eventApi';
import { BookingDetails } from './bookingApi';
import { Vendor } from './vendorApi';
import { Hall } from './hallApi';
import { Invoice } from './invoiceApi';
import { Quotation } from './quotationApi';

export interface GlobalSearchResults {
  customers: Customer[];
  employees: Employee[];
  events: EventDetails[];
  bookings: BookingDetails[];
  vendors: Vendor[];
  halls: Hall[];
  invoices: Invoice[];
  quotations: Quotation[];
}

export const searchApi = {
  search: (query: string) =>
    httpClient.get<GlobalSearchResults>('/search', { q: query })
};
