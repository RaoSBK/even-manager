import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service';

export class BookingController {
  private bookingService = new BookingService();

  /**
   * Create a new booking
   */
  async createBooking(req: Request, res: Response) {
    try {
      // Never trust frontend user ID - get it from req.user set by auth middleware
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { hallId, eventType, eventDate, startTime, endTime, guestCount, notes, addressLine1, addressLine2, city, district, state, country, pincode } = req.body;

      // Validate required fields
      if (!hallId || !eventType || !eventDate || !startTime || !endTime || !guestCount) {
        return res.status(400).json({ message: 'Missing required booking fields' });
      }

      const booking = await this.bookingService.create(userId, {
        hallId,
        eventType,
        eventDate,
        startTime,
        endTime,
        guestCount: Number(guestCount),
        notes,
        addressLine1,
        addressLine2,
        city,
        district,
        state,
        country,
        pincode
      });

      return res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        booking
      });
    } catch (error: any) {
      if (error.message === 'CONFLICT') {
        return res.status(409).json({
          success: false,
          message: 'This hall has already been booked for the selected date and time.'
        });
      }

      if (error.message === 'PAST_DATE') {
        return res.status(400).json({ message: 'Cannot book events in the past date.' });
      }

      if (error.message === 'INVALID_TIME_RANGE') {
        return res.status(400).json({ message: 'End time must be after start time.' });
      }

      if (error.message === 'INVALID_GUEST_COUNT') {
        return res.status(400).json({ message: 'Guest count must be greater than zero.' });
      }

      if (error.message === 'HALL_NOT_FOUND') {
        return res.status(400).json({ message: 'Selected hall does not exist.' });
      }

      if (error.message === 'HALL_UNAVAILABLE_STATUS') {
        return res.status(400).json({ message: 'Selected hall is currently set under maintenance or inactive.' });
      }

      if (error.message === 'USER_NOT_FOUND') {
        return res.status(400).json({ message: 'Authenticated user profile not found.' });
      }

      console.error('Create booking controller error:', error);
      return res.status(500).json({ message: 'Internal server error while creating booking' });
    }
  }

  /**
   * Get booking details by ID
   */
  async getBookingById(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const userId = req.user?.id;
      const role = req.user?.role;

      if (!userId || !role) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const booking = await this.bookingService.getById(id, userId, role);
      return res.status(200).json(booking);
    } catch (error: any) {
      if (error.message === 'NOT_FOUND') {
        return res.status(404).json({ message: 'Booking not found.' });
      }
      if (error.message === 'FORBIDDEN') {
        return res.status(403).json({ message: 'Access denied to this booking details.' });
      }
      console.error('Get booking by ID error:', error);
      return res.status(500).json({ message: 'Internal server error while fetching booking details' });
    }
  }

  /**
   * Get authenticated user's own bookings list
   */
  async getMyBookings(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const bookings = await this.bookingService.getMyBookings(userId);
      return res.status(200).json(bookings);
    } catch (error: any) {
      console.error('Get my bookings error:', error);
      return res.status(500).json({ message: 'Internal server error while fetching my bookings' });
    }
  }

  /**
   * Get all bookings (Admin/Employee only)
   */
  async getAllBookings(req: Request, res: Response) {
    try {
      const bookings = await this.bookingService.getAll();
      return res.status(200).json(bookings);
    } catch (error: any) {
      console.error('Get all bookings error:', error);
      return res.status(500).json({ message: 'Internal server error while fetching all bookings' });
    }
  }

  /**
   * Update booking status (Admin/Employee only)
   */
  async updateBookingStatus(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: 'Status field is required.' });
      }

      const booking = await this.bookingService.updateStatus(id, status);
      return res.status(200).json({
        message: 'Booking status updated successfully',
        booking
      });
    } catch (error: any) {
      if (error.message === 'NOT_FOUND') {
        return res.status(404).json({ message: 'Booking not found.' });
      }
      if (error.message === 'INVALID_STATUS') {
        return res.status(400).json({ message: 'Invalid status value.' });
      }
      console.error('Update booking status error:', error);
      return res.status(500).json({ message: 'Internal server error while updating booking status' });
    }
  }

  /**
   * Cancel booking (Customer/Admin/Employee)
   */
  async cancelBooking(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const userId = req.user?.id;
      const role = req.user?.role;

      if (!userId || !role) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const booking = await this.bookingService.cancel(id, userId, role);
      return res.status(200).json({
        message: 'Booking cancelled successfully',
        booking
      });
    } catch (error: any) {
      if (error.message === 'NOT_FOUND') {
        return res.status(404).json({ message: 'Booking not found.' });
      }
      if (error.message === 'FORBIDDEN') {
        return res.status(403).json({ message: 'Access denied - cannot cancel another user\'s booking.' });
      }
      if (error.message === 'ALREADY_FINALIZED') {
        return res.status(400).json({ message: 'Cannot cancel an already completed, rejected or cancelled booking.' });
      }
      console.error('Cancel booking error:', error);
      return res.status(500).json({ message: 'Internal server error while cancelling booking' });
    }
  }
}
