import { QuotationRepository } from '../repositories/quotation.repository';
import { Quotation, QuotationStatus } from '@prisma/client';
import prisma from '../config/database';

export interface QuotationItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
  serviceType?: string;
  vendorId?: string;
}

export class QuotationService {
  private quotationRepo = new QuotationRepository();

  async getAll(filters: { search?: string; customerId?: string; status?: string } = {}): Promise<Quotation[]> {
    const status = filters.status ? (filters.status as QuotationStatus) : undefined;
    return await this.quotationRepo.findAll({
      search: filters.search,
      customerId: filters.customerId,
      status
    });
  }

  async getById(id: string) {
    const quotation = await this.quotationRepo.findById(id);
    if (!quotation) throw new Error('QUOTATION_NOT_FOUND');
    return quotation;
  }

  async create(data: {
    eventId?: string;
    customerId: string;
    validUntil?: string;
    discount?: number;
    tax?: number;
    notes?: string;
    items: QuotationItemInput[];
  }): Promise<Quotation> {
    const quotationNumber = 'QTN-' + Math.floor(100000 + Math.random() * 900000);
    const discount = data.discount || 0;
    const tax = data.tax || 0;

    // Calculate subtotal
    let subtotal = 0;
    for (const item of data.items) {
      subtotal += item.quantity * item.unitPrice;
    }

    const totalAmount = subtotal - discount + tax;

    return await prisma.$transaction(async (tx) => {
      // 1. Create quotation
      const quotation = await this.quotationRepo.create(tx, {
        quotationNumber,
        eventId: data.eventId || null,
        customerId: data.customerId,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        subtotal,
        discount,
        tax,
        totalAmount,
        notes: data.notes,
        status: QuotationStatus.DRAFT
      });

      // 2. Create line items
      for (const item of data.items) {
        await this.quotationRepo.createItem(tx, {
          quotationId: quotation.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.quantity * item.unitPrice,
          serviceType: item.serviceType || null,
          vendorId: item.vendorId || null
        });
      }

      return quotation;
    });
  }

  async update(
    id: string,
    data: {
      eventId?: string;
      customerId: string;
      validUntil?: string;
      discount?: number;
      tax?: number;
      notes?: string;
      items: QuotationItemInput[];
      status?: string;
    }
  ): Promise<Quotation> {
    const quotation = await this.getById(id);
    const discount = data.discount !== undefined ? data.discount : Number(quotation.discount);
    const tax = data.tax !== undefined ? data.tax : Number(quotation.tax);
    const qtnStatus = data.status ? (data.status as QuotationStatus) : quotation.status;

    let subtotal = 0;
    for (const item of data.items) {
      subtotal += item.quantity * item.unitPrice;
    }

    const totalAmount = subtotal - discount + tax;

    return await prisma.$transaction(async (tx) => {
      // 1. Delete existing line items
      await this.quotationRepo.deleteItems(tx, id);

      // 2. Create new line items
      for (const item of data.items) {
        await this.quotationRepo.createItem(tx, {
          quotationId: id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.quantity * item.unitPrice,
          serviceType: item.serviceType || null,
          vendorId: item.vendorId || null
        });
      }

      // 3. Update parent quotation values
      return await tx.quotation.update({
        where: { id },
        data: {
          eventId: data.eventId || null,
          customerId: data.customerId,
          validUntil: data.validUntil ? new Date(data.validUntil) : null,
          subtotal,
          discount,
          tax,
          totalAmount,
          notes: data.notes,
          status: qtnStatus
        }
      });
    });
  }

  async updateStatus(id: string, status: string): Promise<Quotation> {
    const qtnStatus = status as QuotationStatus;
    return await this.quotationRepo.update(id, { status: qtnStatus });
  }
}
export default QuotationService;
