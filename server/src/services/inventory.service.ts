import { InventoryRepository } from '../repositories/inventory.repository';
import { NotificationService } from './notification.service';
import { InventoryItem, InventoryTransactionType } from '@prisma/client';
import prisma from '../config/database';

export class InventoryService {
  private inventoryRepo = new InventoryRepository();

  async getAll(filters: { search?: string; category?: string; status?: string } = {}): Promise<InventoryItem[]> {
    return await this.inventoryRepo.findAll(filters);
  }

  async getById(id: string): Promise<InventoryItem> {
    const item = await this.inventoryRepo.findById(id);
    if (!item) throw new Error('ITEM_NOT_FOUND');
    return item;
  }

  async create(data: {
    name: string;
    category?: string;
    description?: string;
    quantity?: number;
    unit?: string;
    minimumStock?: number;
    unitCost?: number;
    supplier?: string;
  }): Promise<InventoryItem> {
    const itemCode = 'INV' + Math.floor(100 + Math.random() * 900);
    const quantity = data.quantity || 0;

    const item = await this.inventoryRepo.create({
      itemCode,
      name: data.name,
      category: data.category,
      description: data.description,
      quantity,
      unit: data.unit || 'pcs',
      minimumStock: data.minimumStock || 0,
      unitCost: data.unitCost || 0
    });

    if (quantity > 0) {
      await prisma.$transaction(async (tx) => {
        await this.inventoryRepo.createTransaction(tx, {
          itemId: item.id,
          type: InventoryTransactionType.PURCHASE,
          quantity,
          notes: 'Initial stock load'
        });
      });
    }

    await this.checkLowStock(item);
    return item;
  }

  async update(
    id: string,
    data: {
      name: string;
      category?: string;
      description?: string;
      unit?: string;
      minimumStock?: number;
      unitCost?: number;
      status?: string;
    }
  ): Promise<InventoryItem> {
    const item = await this.inventoryRepo.update(id, data);
    await this.checkLowStock(item);
    return item;
  }

  async updateQuantity(
    id: string,
    data: {
      quantity: number;
      type: 'PURCHASE' | 'USAGE' | 'RETURN' | 'ADJUSTMENT' | 'DAMAGE';
      notes?: string;
    }
  ): Promise<InventoryItem> {
    const item = await this.getById(id);
    const currentQty = item.quantity;
    let newQty = currentQty;

    const type = data.type as InventoryTransactionType;
    if (type === InventoryTransactionType.PURCHASE || type === InventoryTransactionType.RETURN) {
      newQty += data.quantity;
    } else if (type === InventoryTransactionType.USAGE || type === InventoryTransactionType.DAMAGE) {
      newQty -= data.quantity;
    } else {
      // Adjustment
      newQty = data.quantity;
    }

    if (newQty < 0) {
      throw new Error('INSUFFICIENT_STOCK_QUANTITY');
    }

    const updatedItem = await prisma.$transaction(async (tx) => {
      // 1. Log transaction
      await this.inventoryRepo.createTransaction(tx, {
        itemId: id,
        type,
        quantity: data.quantity,
        notes: data.notes || 'Quantity manual override update'
      });

      // 2. Update stock value
      return await tx.inventoryItem.update({
        where: { id },
        data: { quantity: newQty }
      });
    });

    await this.checkLowStock(updatedItem);
    return updatedItem;
  }

  async delete(id: string): Promise<InventoryItem> {
    return await this.inventoryRepo.delete(id);
  }

  async getSummary() {
    const items = await this.inventoryRepo.findAll();
    const totalInventory = items.length;
    let available = 0;
    let lowStock = 0;
    let outOfStock = 0;

    for (const item of items) {
      if (item.quantity === 0) {
        outOfStock++;
      } else {
        available++;
        if (item.quantity <= item.minimumStock) {
          lowStock++;
        }
      }
    }

    return {
      totalInventory,
      available,
      lowStock,
      outOfStock
    };
  }

  async getTransactions(itemId: string) {
    return await this.inventoryRepo.findTransactions(itemId);
  }

  private async checkLowStock(item: InventoryItem) {
    if (item.quantity === 0) {
      await NotificationService.createNotification(
        'Out of Stock Alert',
        `Inventory item "${item.name}" (${item.itemCode}) is completely out of stock.`,
        'error'
      );
    } else if (item.quantity <= item.minimumStock) {
      await NotificationService.createNotification(
        'Low Stock Warning',
        `Inventory item "${item.name}" (${item.itemCode}) has dropped below minimum threshold limit. Current: ${item.quantity} ${item.unit || 'pcs'}`,
        'warning'
      );
    }
  }
}
export default InventoryService;
