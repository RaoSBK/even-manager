import { PrismaClient, Invoice, InvoiceItem, InvoiceStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

export class InvoiceRepository {
  async findAll(filters: { search?: string; bookingId?: string; customerId?: string; status?: InvoiceStatus } = {}): Promise<Invoice[]> {
    const where: Prisma.InvoiceWhereInput = {};

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
        { invoiceNumber: { contains: filters.search, mode: 'insensitive' } },
        { customer: { fullName: { contains: filters.search, mode: 'insensitive' } } }
      ];
    }

    return await prisma.invoice.findMany({
      where,
      include: {
        customer: true,
        booking: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string) {
    return await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        booking: {
          include: {
            hall: true
          }
        },
        items: true
      }
    });
  }

  async create(tx: Prisma.TransactionClient, data: Prisma.InvoiceUncheckedCreateInput): Promise<Invoice> {
    return await tx.invoice.create({ data });
  }

  async createItem(tx: Prisma.TransactionClient, data: Prisma.InvoiceItemUncheckedCreateInput): Promise<InvoiceItem> {
    return await tx.invoiceItem.create({ data });
  }

  async update(id: string, data: Prisma.InvoiceUpdateInput): Promise<Invoice> {
    return await prisma.invoice.update({
      where: { id },
      data
    });
  }
}
