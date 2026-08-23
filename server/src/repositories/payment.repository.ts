import { PrismaClient, Payment, PaymentStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

export class PaymentRepository {
  async findAll(filters: { search?: string; bookingId?: string; customerId?: string; status?: PaymentStatus } = {}): Promise<Payment[]> {
    const where: Prisma.PaymentWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.bookingId) {
      where.bookingId = filters.bookingId;
    }

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.search) {
      where.OR = [
        { paymentNumber: { contains: filters.search, mode: 'insensitive' } },
        { customer: { fullName: { contains: filters.search, mode: 'insensitive' } } },
        { transactionReference: { contains: filters.search } }
      ];
    }

    return await prisma.payment.findMany({
      where,
      include: {
        customer: true,
        booking: true
      },
      orderBy: { paymentDate: 'desc' }
    });
  }

  async findById(id: string): Promise<Payment | null> {
    return await prisma.payment.findUnique({
      where: { id },
      include: {
        customer: true,
        booking: true
      }
    });
  }

  async create(data: Prisma.PaymentUncheckedCreateInput): Promise<Payment> {
    return await prisma.payment.create({ data });
  }

  async update(id: string, data: Prisma.PaymentUpdateInput): Promise<Payment> {
    return await prisma.payment.update({
      where: { id },
      data
    });
  }
}
