import { PrismaClient, TravelBooking, TravelStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

export class TravelRepository {
  async findAll(filters: { search?: string; eventId?: string; customerId?: string; status?: TravelStatus } = {}): Promise<TravelBooking[]> {
    const where: Prisma.TravelBookingWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.eventId) {
      where.eventId = filters.eventId;
    }

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.search) {
      where.OR = [
        { departureLocation: { contains: filters.search, mode: 'insensitive' } },
        { destination: { contains: filters.search, mode: 'insensitive' } },
        { provider: { contains: filters.search, mode: 'insensitive' } },
        { bookingReference: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    return await prisma.travelBooking.findMany({
      where,
      include: {
        customer: true,
        event: true
      },
      orderBy: { departureAt: 'asc' }
    });
  }

  async findById(id: string): Promise<TravelBooking | null> {
    return await prisma.travelBooking.findUnique({
      where: { id },
      include: {
        customer: true,
        event: true
      }
    });
  }

  async create(data: Prisma.TravelBookingUncheckedCreateInput): Promise<TravelBooking> {
    return await prisma.travelBooking.create({ data });
  }

  async update(id: string, data: Prisma.TravelBookingUpdateInput): Promise<TravelBooking> {
    return await prisma.travelBooking.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<TravelBooking> {
    return await prisma.travelBooking.delete({
      where: { id }
    });
  }
}
export default TravelRepository;
