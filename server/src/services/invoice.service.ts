import { InvoiceRepository } from '../repositories/invoice.repository';
import { Invoice, InvoiceStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

export interface InvoiceItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

export class InvoiceService {
  private invoiceRepo = new InvoiceRepository();

  async getAll(filters: { search?: string; bookingId?: string; customerId?: string; status?: string } = {}): Promise<Invoice[]> {
    const status = filters.status ? (filters.status as InvoiceStatus) : undefined;
    return await this.invoiceRepo.findAll({
      search: filters.search,
      bookingId: filters.bookingId,
      customerId: filters.customerId,
      status
    });
  }

  async getById(id: string) {
    const invoice = await this.invoiceRepo.findById(id);
    if (!invoice) throw new Error('INVOICE_NOT_FOUND');
    return invoice;
  }

  async create(data: {
    bookingId?: string;
    customerId?: string;
    issueDate?: string;
    dueDate?: string;
    discount?: number;
    tax?: number;
    notes?: string;
    items: InvoiceItemInput[];
  }): Promise<Invoice> {
    const invoiceNumber = 'INV-' + Math.floor(100000 + Math.random() * 900000);
    const discount = data.discount || 0;
    const tax = data.tax || 0;

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

    // Calculate subtotal
    let subtotal = 0;
    for (const item of data.items) {
      subtotal += item.quantity * item.unitPrice;
    }

    const totalAmount = subtotal - discount + tax;

    // Fetch paid amount from payments linked to the booking
    let paidAmount = 0;
    if (data.bookingId) {
      const payments = await prisma.payment.findMany({
        where: {
          bookingId: data.bookingId,
          status: 'SUCCESS'
        }
      });
      paidAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    }

    const balanceAmount = totalAmount - paidAmount;
    let status: InvoiceStatus = InvoiceStatus.ISSUED;
    if (paidAmount >= totalAmount) {
      status = InvoiceStatus.PAID;
    } else if (paidAmount > 0) {
      status = InvoiceStatus.PARTIALLY_PAID;
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Create Invoice
      const invoice = await this.invoiceRepo.create(tx, {
        invoiceNumber,
        bookingId: data.bookingId || undefined,
        customerId,
        issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        subtotal,
        discount,
        tax,
        totalAmount,
        paidAmount,
        balanceAmount: balanceAmount < 0 ? 0 : balanceAmount,
        status,
        notes: data.notes || null
      });

      // 2. Create Items
      for (const item of data.items) {
        await this.invoiceRepo.createItem(tx, {
          invoiceId: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.quantity * item.unitPrice
        });
      }

      return invoice;
    });
  }

  async updateStatus(id: string, status: string): Promise<Invoice> {
    const invStatus = status as InvoiceStatus;
    return await this.invoiceRepo.update(id, { status: invStatus });
  }

  async syncPaidStatus(bookingId: string): Promise<void> {
    const invoices = await prisma.invoice.findMany({
      where: { bookingId }
    });

    const payments = await prisma.payment.findMany({
      where: { bookingId, status: 'SUCCESS' }
    });

    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    for (const inv of invoices) {
      const totalAmount = Number(inv.totalAmount);
      const balance = totalAmount - totalPaid;
      
      let status: InvoiceStatus = InvoiceStatus.ISSUED;
      if (totalPaid >= totalAmount) {
        status = InvoiceStatus.PAID;
      } else if (totalPaid > 0) {
        status = InvoiceStatus.PARTIALLY_PAID;
      }

      await prisma.invoice.update({
        where: { id: inv.id },
        data: {
          paidAmount: totalPaid,
          balanceAmount: balance < 0 ? 0 : balance,
          status
        }
      });
    }
  }
}
export default InvoiceService;
