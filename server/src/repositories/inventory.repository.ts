import { PrismaClient, InventoryItem, InventoryTransaction, Prisma, InventoryTransactionType } from '@prisma/client';
import prisma from '../config/database';

export class InventoryRepository {
  async findAll(filters: { search?: string; category?: string; status?: string } = {}): Promise<InventoryItem[]> {
    const where: Prisma.InventoryItemWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.category) {
      where.category = { contains: filters.category, mode: 'insensitive' };
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { itemCode: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    return await prisma.inventoryItem.findMany({
      where,
      orderBy: { name: 'asc' }
    });
  }

  async findById(id: string): Promise<InventoryItem | null> {
    return await prisma.inventoryItem.findUnique({
      where: { id }
    });
  }

  async create(data: Prisma.InventoryItemCreateInput): Promise<InventoryItem> {
    return await prisma.inventoryItem.create({ data });
  }

  async update(id: string, data: Prisma.InventoryItemUpdateInput): Promise<InventoryItem> {
    return await prisma.inventoryItem.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<InventoryItem> {
    return await prisma.inventoryItem.delete({
      where: { id }
    });
  }

  async createTransaction(tx: Prisma.TransactionClient, data: Prisma.InventoryTransactionUncheckedCreateInput): Promise<InventoryTransaction> {
    return await tx.inventoryTransaction.create({ data });
  }

  async findTransactions(itemId: string): Promise<InventoryTransaction[]> {
    return await prisma.inventoryTransaction.findMany({
      where: { itemId },
      orderBy: { createdAt: 'desc' }
    });
  }
}
export default InventoryRepository;
