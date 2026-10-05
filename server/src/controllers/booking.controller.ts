import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service';

export class BookingController {
  private bookingService = new BookingService();

  /**
   * Create a new pending booking & Razorpay Order
   */
  async createPendingBooking(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const {
        hallId,
        eventType,
        eventDate,
        startTime,
        endTime,
        guestCount,
        selectedServices,
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        specialNotes
      } = req.body;

      if (!hallId || !eventDate || !startTime || !endTime || !customerName || !customerPhone || !customerEmail) {
        return res.status(400).json({ message: 'All booking contact details and parameters are required.' });
      }

      const result = await this.bookingService.createPendingBooking(userId, {
        hallId,
        eventType: eventType || 'General Event',
        eventDate,
        startTime,
        endTime,
        guestCount: Number(guestCount || 100),
        selectedServices,
        customerName,
        customerPhone,
        customerEmail,
        customerAddress: customerAddress || '',
        specialNotes
      });

      return res.status(201).json({
        success: true,
        message: 'Pending booking created and Razorpay order generated successfully',
        ...result
      });
    } catch (error: any) {
      if (error.message === 'CONFLICT') {
        return res.status(409).json({
          success: false,
          message: 'This hall is no longer available for the selected date. Please select another date or hall.'
        });
      }

      if (error.message === 'PAST_DATE') {
        return res.status(400).json({ message: 'Cannot book events in the past.' });
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
        return res.status(400).json({ message: 'Selected hall is currently under maintenance or inactive.' });
      }

      console.error('Create pending booking error:', error);
      return res.status(500).json({ message: 'Internal server error while creating pending booking' });
    }
  }

  /**
   * Verify Razorpay Payment Signature
   */
  async verifyRazorpayPayment(req: Request, res: Response) {
    try {
      const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ message: 'Missing Razorpay signature verification parameters.' });
      }

      const result = await this.bookingService.verifyRazorpayPayment({
        bookingId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      });

      return res.status(200).json(result);
    } catch (error: any) {
      if (error.message === 'INVALID_SIGNATURE') {
        return res.status(400).json({ success: false, message: 'Invalid Razorpay payment signature verification.' });
      }
      if (error.message === 'DOUBLE_BOOKING_CONFLICT') {
        return res.status(409).json({ success: false, message: 'This hall is no longer available for the selected date.' });
      }
      console.error('Verify payment error:', error);
      return res.status(500).json({ message: 'Internal server error during payment signature verification' });
    }
  }

  /**
   * Retry Razorpay Payment for existing pending booking
   */
  async retryRazorpayOrder(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { bookingId } = req.body;
      if (!bookingId) {
        return res.status(400).json({ message: 'Booking ID is required' });
      }

      const result = await this.bookingService.retryRazorpayOrder(bookingId, userId);
      return res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      if (error.message === 'CONFLICT') {
        return res.status(409).json({ message: 'This hall is no longer available for the selected date.' });
      }
      console.error('Retry payment order error:', error);
      return res.status(500).json({ message: error.message || 'Internal server error during payment retry' });
    }
  }

  /**
   * Handle Razorpay Webhook Event
   */
  async processRazorpayWebhook(req: Request, res: Response) {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      await this.bookingService.processRazorpayWebhook(rawBody, signature, req.body);
      return res.status(200).json({ status: 'ok' });
    } catch (error: any) {
      console.error('Webhook processing error:', error);
      return res.status(400).json({ message: error.message || 'Webhook verification failed' });
    }
  }

  /**
   * Create a standard booking
   */
  async createBooking(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { hallId, eventType, eventDate, startTime, endTime, guestCount, notes, addressLine1, addressLine2, city, district, state, country, pincode } = req.body;

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
      return res.status(500).json({ message: error.message || 'Internal server error' });
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
      return res.status(500).json({ message: 'Internal server error while updating booking status' });
    }
  }

  /**
   * Cancel booking
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
      return res.status(500).json({ message: 'Internal server error while cancelling booking' });
    }
  }
}
