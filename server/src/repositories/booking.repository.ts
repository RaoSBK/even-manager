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
        in: [BookingStatus.PENDING, BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS]
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
  /**
   * Find all bookings for a specific hall with optional filtering and pagination
   */
  async findByHallId(
    hallId: string,
    filters?: {
      status?: string;
      eventType?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ bookings: Booking[]; total: number; page: number; limit: number }> {
    const where: Prisma.BookingWhereInput = { hallId };

    if (filters?.status && filters.status !== 'ALL') {
      where.status = filters.status as BookingStatus;
    }

    if (filters?.eventType && filters.eventType !== 'ALL') {
      where.eventType = { contains: filters.eventType, mode: 'insensitive' };
    }

    if (filters?.startDate || filters?.endDate) {
      where.eventDate = {};
      if (filters.startDate) {
        where.eventDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.eventDate.lte = new Date(filters.endDate);
      }
    }

    const page = Math.max(filters?.page || 1, 1);
    const limit = Math.min(Math.max(filters?.limit || 50, 1), 100);
    const skip = (page - 1) * limit;

    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              mobile: true
            }
          },
          customer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              city: true
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              paymentMethod: true,
              paymentDate: true,
              razorpayPaymentId: true
            }
          }
        },
        orderBy: {
          bookingDate: 'desc'
        },
        skip,
        take: limit
      })
    ]);

    return { bookings, total, page, limit };
  }

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
   * Cancel a booking by setting status to CANCELLED, recording cancelledAt and cancellationReason
   */
  async cancelBooking(id: string, cancellationReason?: string): Promise<Booking> {
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: cancellationReason || null
      }
    });

    if (booking.eventId) {
      try {
        await prisma.event.update({
          where: { id: booking.eventId },
          data: { status: 'CANCELLED' }
        });
      } catch (e) {
        console.warn('Could not update associated event status:', e);
      }
    }

    return booking;
  }
}
