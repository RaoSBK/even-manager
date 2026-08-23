import { PaymentRepository } from '../repositories/payment.repository';
import { NotificationService } from './notification.service';
import { Payment, PaymentStatus, PaymentMethod } from '@prisma/client';
import prisma from '../config/database';

export class PaymentService {
  private paymentRepo = new PaymentRepository();

  async getAll(filters: { search?: string; bookingId?: string; customerId?: string; status?: string } = {}): Promise<Payment[]> {
    const status = filters.status ? (filters.status as PaymentStatus) : undefined;
    return await this.paymentRepo.findAll({
      search: filters.search,
      bookingId: filters.bookingId,
      customerId: filters.customerId,
      status
    });
  }

  async getById(id: string): Promise<Payment> {
    const payment = await this.paymentRepo.findById(id);
    if (!payment) throw new Error('PAYMENT_NOT_FOUND');
    return payment;
  }

  async create(data: {
    bookingId?: string;
    customerId?: string;
    amount: number;
    paymentMethod: string;
    transactionReference?: string;
    status?: string;
    notes?: string;
  }): Promise<Payment> {
    const paymentNumber = 'PAY-' + Math.floor(100000 + Math.random() * 900000);
    const pStatus = data.status ? (data.status as PaymentStatus) : PaymentStatus.SUCCESS;
    const pMethod = data.paymentMethod ? (data.paymentMethod as PaymentMethod) : PaymentMethod.CASH;

    let customerId = data.customerId;
    if (!customerId && data.bookingId) {
      const booking = await prisma.booking.findUnique({ where: { id: data.bookingId } });
      if (booking) {
        customerId = booking.customerId || undefined;
      }
    }

    if (!customerId) {
      throw new Error('CUSTOMER_ID_REQUIRED');
    }

    const payment = await this.paymentRepo.create({
      paymentNumber,
      bookingId: data.bookingId || undefined,
      customerId,
      amount: data.amount,
      paymentMethod: pMethod,
      transactionReference: data.transactionReference || null,
      status: pStatus,
      notes: data.notes || null
    });

    if (pStatus === PaymentStatus.SUCCESS) {
      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      await NotificationService.createNotification(
        'Payment Received',
        `Payment of ₹${data.amount.toLocaleString('en-IN')} received from customer "${customer?.fullName || 'Client'}". Reference: ${paymentNumber}`,
        'success'
      );

      // If linked to booking, check if booking total has been satisfied and update booking payment status
      if (data.bookingId) {
        const booking = await prisma.booking.findUnique({
          where: { id: data.bookingId },
          include: { payments: true }
        });

        if (booking) {
          const totalPaid = booking.payments
            .filter((p) => p.status === PaymentStatus.SUCCESS)
            .reduce((sum, p) => sum + Number(p.amount), 0) + data.amount;

          const totalAmount = Number(booking.totalAmount);

          await prisma.booking.update({
            where: { id: data.bookingId },
            data: {
              advanceAmount: totalPaid,
              balanceAmount: totalAmount - totalPaid < 0 ? 0 : totalAmount - totalPaid
            }
          });
        }
      }
    }

    return payment;
  }

  async updateStatus(id: string, status: string): Promise<Payment> {
    const payment = await this.getById(id);
    const pStatus = status as PaymentStatus;
    const updated = await this.paymentRepo.update(id, { status: pStatus });

    if (pStatus === PaymentStatus.SUCCESS) {
      const customer = await prisma.customer.findUnique({ where: { id: payment.customerId } });
      await NotificationService.createNotification(
        'Payment Verified',
        `Payment reference ${payment.paymentNumber} of ₹${Number(payment.amount).toLocaleString('en-IN')} has been marked SUCCESS for "${customer?.fullName || 'Client'}".`,
        'success'
      );
    }

    return updated;
  }
}
export default PaymentService;
