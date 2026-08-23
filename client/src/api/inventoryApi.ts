import { httpClient } from './httpClient';

export interface InventoryItem {
  id: string;
  itemCode: string;
  name: string;
  category?: string;
  description?: string;
  quantity: number;
  unit?: string;
  minimumStock: number;
  unitCost: number;
  status: string;
  createdAt: string;
}

export interface InventorySummary {
  totalInventory: number;
  available: number;
  lowStock: number;
  outOfStock: number;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  type: 'PURCHASE' | 'USAGE' | 'RETURN' | 'ADJUSTMENT' | 'DAMAGE';
  quantity: number;
  notes?: string;
  createdAt: string;
}

export const inventoryApi = {
  getAll: (filters: { search?: string; category?: string; status?: string } = {}) =>
    httpClient.get<InventoryItem[]>('/inventory', filters),

  getSummary: () =>
    httpClient.get<InventorySummary>('/inventory/summary'),

  getById: (id: string) =>
    httpClient.get<InventoryItem>(`/inventory/${id}`),

  create: (data: Partial<InventoryItem>) =>
    httpClient.post<InventoryItem>('/inventory', data),

  update: (id: string, data: Partial<InventoryItem>) =>
    httpClient.put<InventoryItem>(`/inventory/${id}`, data),

  updateQuantity: (id: string, quantity: number, type: string, notes?: string) =>
    httpClient.patch<InventoryItem>(`/inventory/${id}/quantity`, { quantity, type, notes }),

  delete: (id: string) =>
    httpClient.delete<InventoryItem>(`/inventory/${id}`),

  getTransactions: (itemId: string) =>
    httpClient.get<InventoryTransaction[]>(`/inventory/${itemId}/transactions`)
};
