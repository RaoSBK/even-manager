import { PrismaClient, Booking, BookingStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

export class BookingRepository {
  /**
   * Check for conflicting active bookings (PENDING, CONFIRMED, IN_PROGRESS) on the same hall, date, and overlapping time
   */
  async findConflictingBooking(
    tx: Prisma.TransactionClient,
    hallId: string,
    eventDate: Date,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): Promise<Booking | null> {
    // Normalizing the date portion to midnight UTC (so date checks are exact)
    const normalizedDate = new Date(eventDate);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    const whereClause: Prisma.BookingWhereInput = {
      hallId,
      eventDate: normalizedDate,
      status: {
        in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS]
      },
      // Interval overlap check: (start1 < end2) && (end1 > start2)
      startTime: { lt: endTime },
      endTime: { gt: startTime }
    };

    if (excludeBookingId) {
      whereClause.id = { not: excludeBookingId };
    }

    return await tx.booking.findFirst({
      where: whereClause
    });
  }

  /**
   * Create a new booking inside a transaction
   */
  async createBooking(
    tx: Prisma.TransactionClient,
    data: Prisma.BookingUncheckedCreateInput
  ): Promise<Booking> {
    return await tx.booking.create({
      data
    });
  }

  /**
   * Find booking by ID
   */
  async findById(id: string): Promise<Booking | null> {
    return await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true
          }
        },
        hall: true
      }
    });
  }

  /**
   * Get all bookings for a user
   */
  async findByUserId(userId: string): Promise<Booking[]> {
    return await prisma.booking.findMany({
      where: { userId },
      include: {
        hall: true
      },
      orderBy: {
        bookingDate: 'desc'
      }
    });
  }

  /**
   * Get all bookings in the system
   */
  async findAll(): Promise<Booking[]> {
    return await prisma.booking.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true
          }
        },
        hall: true
      },
      orderBy: {
        bookingDate: 'desc'
      }
    });
  }

  /**
   * Update booking status
   */
  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    return await prisma.booking.update({
      where: { id },
      data: { status }
    });
  }

  /**
   * Cancel a booking by setting status to CANCELLED and setting cancelledAt timestamp
   */
  async cancelBooking(id: string): Promise<Booking> {
    return await prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date()
      }
    });
  }
}
