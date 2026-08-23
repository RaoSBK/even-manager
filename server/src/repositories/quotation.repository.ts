import { PrismaClient, Quotation, QuotationItem, QuotationStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

export class QuotationRepository {
  async findAll(filters: { search?: string; customerId?: string; status?: QuotationStatus } = {}): Promise<Quotation[]> {
    const where: Prisma.QuotationWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.search) {
      where.OR = [
        { quotationNumber: { contains: filters.search, mode: 'insensitive' } },
        { customer: { fullName: { contains: filters.search, mode: 'insensitive' } } },
        { event: { eventName: { contains: filters.search, mode: 'insensitive' } } }
      ];
    }

    return await prisma.quotation.findMany({
      where,
      include: {
        customer: true,
        event: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string) {
    return await prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        event: true,
        items: {
          include: {
            vendor: true
          }
        }
      }
    });
  }

  async create(tx: Prisma.TransactionClient, data: Prisma.QuotationUncheckedCreateInput): Promise<Quotation> {
    return await tx.quotation.create({ data });
  }

  async createItem(tx: Prisma.TransactionClient, data: Prisma.QuotationItemUncheckedCreateInput): Promise<QuotationItem> {
    return await tx.quotationItem.create({ data });
  }

  async deleteItems(tx: Prisma.TransactionClient, quotationId: string): Promise<void> {
    await tx.quotationItem.deleteMany({
      where: { quotationId }
    });
  }

  async update(id: string, data: Prisma.QuotationUpdateInput): Promise<Quotation> {
    return await prisma.quotation.update({
      where: { id },
      data
    });
  }
}
