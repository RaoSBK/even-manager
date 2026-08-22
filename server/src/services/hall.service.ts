import prisma from '../config/database';
import { Hall, BookingStatus } from '@prisma/client';

export class HallService {
  /**
   * Check hall availability by date and optional time range
   */
  async checkAvailability(
    dateStr: string,
    startTime?: string,
    endTime?: string
  ): Promise<any[]> {
    // Parse date and normalize to midnight UTC
    const queryDate = new Date(dateStr);
    queryDate.setUTCHours(0, 0, 0, 0);

    // Fetch all active halls
    const halls = await prisma.hall.findMany({
      where: {
        status: 'AVAILABLE',
        deletedAt: null
      }
    });

    const results = [];

    for (const hall of halls) {
      // Find conflicting active bookings
      const whereClause: any = {
        hallId: hall.id,
        eventDate: queryDate,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS]
        }
      };

      // Apply time-based checking if requested
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
        capacity: hall.capacity,
        basePrice: Number(hall.basePrice),
        status: hall.status,
        available: !conflict
      });
    }

    return results;
  }
}
