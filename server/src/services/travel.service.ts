import { TravelRepository } from '../repositories/travel.repository';
import { TravelBooking, TravelStatus } from '@prisma/client';
import prisma from '../config/database';

export class TravelService {
  private travelRepo = new TravelRepository();

  async getAll(filters: { search?: string; eventId?: string; customerId?: string; status?: string } = {}): Promise<TravelBooking[]> {
    const status = filters.status ? (filters.status as TravelStatus) : undefined;
    return await this.travelRepo.findAll({
      search: filters.search,
      eventId: filters.eventId,
      customerId: filters.customerId,
      status
    });
  }

  async getById(id: string): Promise<TravelBooking> {
    const travel = await this.travelRepo.findById(id);
    if (!travel) throw new Error('TRAVEL_BOOKING_NOT_FOUND');
    return travel;
  }

  async create(data: {
    eventId?: string;
    customerId?: string;
    travelType: string;
    provider?: string;
    bookingReference?: string;
    departureLocation?: string;
    destination?: string;
    departureAt?: string;
    arrivalAt?: string;
    passengerCount?: number;
    amount?: number;
    status?: string;
    notes?: string;
  }): Promise<TravelBooking> {
    let customerId = data.customerId;
    if (!customerId && data.eventId) {
      const event = await prisma.event.findUnique({ where: { id: data.eventId } });
      if (event) {
        customerId = event.customerId;
      }
    }

    if (!customerId) {
      throw new Error('CUSTOMER_ID_REQUIRED');
    }

    const tStatus = data.status ? (data.status as TravelStatus) : TravelStatus.PENDING;

    return await this.travelRepo.create({
      customerId,
      travelType: data.travelType,
      provider: data.provider || null,
      bookingReference: data.bookingReference || null,
      departureLocation: data.departureLocation || null,
      destination: data.destination || null,
      departureAt: data.departureAt ? new Date(data.departureAt) : null,
      arrivalAt: data.arrivalAt ? new Date(data.arrivalAt) : null,
      passengerCount: data.passengerCount || 1,
      amount: data.amount || 0,
      status: tStatus,
      notes: data.notes || null,
      eventId: data.eventId || null
    });
  }

  async update(
    id: string,
    data: {
      eventId?: string;
      customerId?: string;
      travelType?: string;
      provider?: string;
      bookingReference?: string;
      departureLocation?: string;
      destination?: string;
      departureAt?: string;
      arrivalAt?: string;
      passengerCount?: number;
      amount?: number;
      status?: string;
      notes?: string;
    }
  ): Promise<TravelBooking> {
    const tStatus = data.status ? (data.status as TravelStatus) : undefined;
    return await this.travelRepo.update(id, {
      travelType: data.travelType,
      provider: data.provider,
      bookingReference: data.bookingReference,
      departureLocation: data.departureLocation,
      destination: data.destination,
      departureAt: data.departureAt ? new Date(data.departureAt) : undefined,
      arrivalAt: data.arrivalAt ? new Date(data.arrivalAt) : undefined,
      passengerCount: data.passengerCount,
      amount: data.amount,
      status: tStatus,
      notes: data.notes,
      event: data.eventId ? { connect: { id: data.eventId } } : { disconnect: true },
      customer: data.customerId ? { connect: { id: data.customerId } } : undefined
    });
  }

  async delete(id: string): Promise<TravelBooking> {
    return await this.travelRepo.delete(id);
  }
}
export default TravelService;
