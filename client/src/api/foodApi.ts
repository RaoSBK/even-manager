import { httpClient } from './httpClient';

export interface FoodItem {
  id: string;
  name: string;
  category: 'VEG' | 'NON-VEG';
  price: number;
  active: boolean; // boolean representation
  createdAt?: string;
  updatedAt?: string;
}

export async function getFoodItems(): Promise<FoodItem[]> {
  const responseData = await httpClient.get<any[]>('/food-items');

  // Map 1/0 from sqlite/postgres to boolean active
  return responseData.map((item: any) => ({
    ...item,
    active: item.active === 1 || item.active === true
  }));
}

export async function createFoodItem(itemData: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<FoodItem> {
  const responseData = await httpClient.post<any>('/food-items', {
    ...itemData,
    active: itemData.active ? 1 : 0
  });

  return {
    ...responseData,
    active: responseData.active === 1 || responseData.active === true
  };
}

export async function updateFoodItem(
  id: string,
  itemData: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<FoodItem> {
  const responseData = await httpClient.put<any>(`/food-items/${id}`, {
    ...itemData,
    active: itemData.active ? 1 : 0
  });

  return {
    ...responseData,
    active: responseData.active === 1 || responseData.active === true
  };
}

export async function deleteFoodItem(id: string): Promise<{ message: string }> {
  return httpClient.delete<{ message: string }>(`/food-items/${id}`);
}

export const foodApi = {
  getFoodItems,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem
};

export default foodApi;
