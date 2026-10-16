import { HallRepository } from '../repositories/hall.repository';
import prisma from '../config/database';
import { Hall, HallStatus, BookingStatus, Prisma } from '@prisma/client';

export class HallService {
  private hallRepo = new HallRepository();

  /**
   * Check hall availability by date and optional time range
   */
  async checkAvailability(
    dateStr: string,
    startTime?: string,
    endTime?: string
  ): Promise<any[]> {
    const queryDate = new Date(dateStr);
    queryDate.setUTCHours(0, 0, 0, 0);

    const halls = await this.hallRepo.findAll();
    const results = [];

    for (const hall of halls) {
      if (hall.status !== 'AVAILABLE') {
        results.push({
          id: hall.id,
          name: hall.name,
          hallCode: hall.hallCode,
          description: hall.description,
          location: hall.location,
          state: (hall as any).state || null,
          district: (hall as any).district || null,
          mandal: (hall as any).mandal || null,
          capacity: hall.capacity,
          basePrice: Number(hall.basePrice),
          status: hall.status,
          available: false
        });
        continue;
      }

      const whereClause: any = {
        hallId: hall.id,
        eventDate: queryDate,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS]
        }
      };

      if (startTime && endTime) {
        whereClause.startTime = { lt: endTime };
        whereClause.endTime = { gt: startTime };
      }

      const conflict = await prisma.booking.findFirst({
        where: whereClause
      });

      results.push({
        id: hall.id,
        name: hall.name,
        hallCode: hall.hallCode,
        description: hall.description,
        location: hall.location,
        state: (hall as any).state || null,
        district: (hall as any).district || null,
        mandal: (hall as any).mandal || null,
        capacity: hall.capacity,
        basePrice: Number(hall.basePrice),
        status: hall.status,
        available: !conflict
      });
    }

    return results;
  }

  /**
   * CRUD
   */
  async getHalls(): Promise<Hall[]> {
    return await this.hallRepo.findAll();
  }

  async getHallById(id: string): Promise<Hall> {
    const hall = await this.hallRepo.findById(id);
    if (!hall) throw new Error('HALL_NOT_FOUND');
    return hall;
  }

  async createHall(data: {
    name: string;
    description?: string;
    location?: string;
    state?: string;
    district?: string;
    mandal?: string;
    capacity: number;
    basePrice: number;
    status?: HallStatus;
  }): Promise<Hall> {
    const hallCode = 'HALL-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    return await this.hallRepo.create({
      hallCode,
      name: data.name,
      description: data.description || null,
      location: data.location || null,
      state: data.state || null,
      district: data.district || null,
      mandal: data.mandal || null,
      capacity: Number(data.capacity),
      basePrice: Number(data.basePrice),
      status: data.status || HallStatus.AVAILABLE
    } as any);
  }

  async updateHall(id: string, data: any): Promise<Hall> {
    const hall = await this.hallRepo.findById(id);
    if (!hall) throw new Error('HALL_NOT_FOUND');

    const updateData: any = {
      name: data.name,
      description: data.description,
      location: data.location,
      state: data.state !== undefined ? data.state : undefined,
      district: data.district !== undefined ? data.district : undefined,
      mandal: data.mandal !== undefined ? data.mandal : undefined,
      capacity: data.capacity ? Number(data.capacity) : undefined,
      basePrice: data.basePrice ? Number(data.basePrice) : undefined,
      status: data.status
    };

    return await this.hallRepo.update(id, updateData);
  }

  async deleteHall(id: string): Promise<Hall> {
    const hall = await this.hallRepo.findById(id);
    if (!hall) throw new Error('HALL_NOT_FOUND');
    return await this.hallRepo.delete(id);
  }

  /**
   * Monthly calendar bookings for a specific hall
   */
  async getHallBookings(hallId: string, start: string, end: string): Promise<any[]> {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const bookings = await prisma.booking.findMany({
      where: {
        hallId,
        eventDate: {
          gte: startDate,
          lte: endDate
        },
        status: {
          not: BookingStatus.CANCELLED
        }
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });

    return bookings.map(b => ({
      id: b.id,
      title: b.eventType || 'Event Booking',
      start: b.eventDate,
      startTime: b.startTime,
      endTime: b.endTime,
      status: b.status, // PENDING, CONFIRMED, COMPLETED
      clientName: b.user?.name || 'Client'
    }));
  }
}
