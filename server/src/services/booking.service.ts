import { BookingRepository } from '../repositories/booking.repository';
import prisma from '../config/database';
import { Booking, BookingStatus, Prisma } from '@prisma/client';

export class BookingService {
  private bookingRepo = new BookingRepository();

  /**
   * Helper to generate unique booking numbers
   */
  private generateBookingNumber(): string {
    return 'BK-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }

  /**
   * Create a new event booking with strict double-booking check inside a database transaction
   */
  async create(
    userId: string,
    data: {
      hallId: string;
      eventType: string;
      eventDate: string; // YYYY-MM-DD format
      startTime: string; // HH:MM format
      endTime: string; // HH:MM format
      guestCount: number;
      notes?: string;
    }
  ): Promise<Booking> {
    const { hallId, eventType, eventDate, startTime, endTime, guestCount, notes } = data;

    // 1. Validations: Date parsing and past check
    const normalizedDate = new Date(eventDate);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (normalizedDate < today) {
      throw new Error('PAST_DATE');
    }

    // 2. Validate time order
    if (startTime >= endTime) {
      throw new Error('INVALID_TIME_RANGE');
    }

    // 3. Verify guest count
    if (!guestCount || guestCount <= 0) {
      throw new Error('INVALID_GUEST_COUNT');
    }

    // 4. Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // 5. Verify hall exists and get basePrice
    const hall = await prisma.hall.findUnique({ where: { id: hallId } });
    if (!hall) {
      throw new Error('HALL_NOT_FOUND');
    }

    if (hall.status !== 'AVAILABLE') {
      throw new Error('HALL_UNAVAILABLE_STATUS');
    }

    // 6. Calculate totalAmount securely using backend hall basePrice (per day/event)
    const totalAmount = hall.basePrice;

    // 7. Start database transaction to ensure double-booking prevention under concurrent requests
    return await prisma.$transaction(async (tx) => {
      // Check for overlap inside transaction lock
      const conflict = await this.bookingRepo.findConflictingBooking(
        tx,
        hallId,
        normalizedDate,
        startTime,
        endTime
      );

      if (conflict) {
        throw new Error('CONFLICT');
      }

      // Generate booking number
      const bookingNumber = this.generateBookingNumber();

      // Create booking inside transaction
      return await this.bookingRepo.createBooking(tx, {
        bookingNumber,
        userId,
        hallId,
        eventType,
        eventDate: normalizedDate,
        startTime,
        endTime,
        guestCount,
        totalAmount,
        status: BookingStatus.PENDING,
        notes: notes || null
      });
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    });
  }

  /**
   * Get booking details with authentication and authorization check
   */
  async getById(id: string, userId: string, role: string): Promise<Booking> {
    const booking = await this.bookingRepo.findById(id);
    if (!booking) {
      throw new Error('NOT_FOUND');
    }

    // Customer can only view their own bookings
    if (role !== 'Admin' && role !== 'Employee' && booking.userId !== userId) {
      throw new Error('FORBIDDEN');
    }

    return booking;
  }

  /**
   * Get own bookings list for Customer
   */
  async getMyBookings(userId: string): Promise<Booking[]> {
    return await this.bookingRepo.findByUserId(userId);
  }

  /**
   * Get all bookings in the system (Admin / Employee)
   */
  async getAll(): Promise<Booking[]> {
    return await this.bookingRepo.findAll();
  }

  /**
   * Update booking status (Admin / Employee)
   */
  async updateStatus(id: string, status: string): Promise<Booking> {
    // Validate status string to match BookingStatus enum
    const validStatuses = Object.keys(BookingStatus);
    if (!validStatuses.includes(status)) {
      throw new Error('INVALID_STATUS');
    }

    const booking = await this.bookingRepo.findById(id);
    if (!booking) {
      throw new Error('NOT_FOUND');
    }

    return await this.bookingRepo.updateStatus(id, status as BookingStatus);
  }

  /**
   * Cancel booking (Customer can cancel their own, Admin can cancel any)
   */
  async cancel(id: string, userId: string, role: string): Promise<Booking> {
    const booking = await this.bookingRepo.findById(id);
    if (!booking) {
      throw new Error('NOT_FOUND');
    }

    // Authorization check
    if (role !== 'Admin' && role !== 'Employee' && booking.userId !== userId) {
      throw new Error('FORBIDDEN');
    }

    // Prevent cancelling already completed or cancelled bookings
    if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.REJECTED || booking.status === BookingStatus.COMPLETED) {
      throw new Error('ALREADY_FINALIZED');
    }

    return await this.bookingRepo.cancelBooking(id);
  }
}
