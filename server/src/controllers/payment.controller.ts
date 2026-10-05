import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { BookingService } from '../services/booking.service';

export class PaymentController {
  private paymentService = new PaymentService();
  private bookingService = new BookingService();

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters = {
        search: req.query.search as string,
        bookingId: req.query.bookingId as string,
        customerId: req.query.customerId as string,
        status: req.query.status as string
      };
      const list = await this.paymentService.getAll(filters);
      res.status(200).json(list);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const payment = await this.paymentService.getById(req.params.id as string);
      res.status(200).json(payment);
    } catch (err: any) {
      res.status(404).json({ message: err.message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const payment = await this.paymentService.create(req.body);
      res.status(201).json(payment);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const payment = await this.paymentService.updateStatus(req.params.id as string, req.body.status as string);
      res.status(200).json(payment);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  /**
   * Verify Razorpay payment signature (HMAC SHA256)
   */
  verifyRazorpayPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        res.status(400).json({ message: 'Missing Razorpay signature verification parameters.' });
        return;
      }

      const result = await this.bookingService.verifyRazorpayPayment({
        bookingId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      });

      res.status(200).json(result);
    } catch (err: any) {
      if (err.message === 'INVALID_SIGNATURE') {
        res.status(400).json({ success: false, message: 'Invalid Razorpay payment signature.' });
        return;
      }
      if (err.message === 'DOUBLE_BOOKING_CONFLICT') {
        res.status(409).json({ success: false, message: 'This hall is no longer available for the selected date.' });
        return;
      }
      console.error('Verify payment error:', err);
      res.status(500).json({ message: err.message || 'Internal server error during payment verification' });
    }
  };

  /**
   * Retry Razorpay payment order for existing pending booking
   */
  retryRazorpayOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { bookingId } = req.body;
      if (!bookingId) {
        res.status(400).json({ message: 'Booking ID is required' });
        return;
      }

      const result = await this.bookingService.retryRazorpayOrder(bookingId, userId);
      res.status(200).json({ success: true, ...result });
    } catch (err: any) {
      if (err.message === 'CONFLICT') {
        res.status(409).json({ message: 'This hall is no longer available for the selected date.' });
        return;
      }
      console.error('Retry payment order error:', err);
      res.status(500).json({ message: err.message || 'Internal server error' });
    }
  };

  /**
   * Razorpay Webhook Event handler
   */
  processRazorpayWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      await this.bookingService.processRazorpayWebhook(rawBody, signature, req.body);
      res.status(200).json({ status: 'ok' });
    } catch (err: any) {
      console.error('Webhook error:', err);
      res.status(400).json({ message: err.message || 'Webhook verification failed' });
    }
  };
}

export default PaymentController;
