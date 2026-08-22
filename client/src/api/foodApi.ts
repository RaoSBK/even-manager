import { API_HOST } from './httpClient';
const BASE_URL = `${API_HOST}/api/food-items`;

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
  const response = await fetch(BASE_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Failed to fetch food items');
  }

  // Map 1/0 from sqlite to boolean active
  return responseData.map((item: any) => ({
    ...item,
    active: item.active === 1 || item.active === true
  }));
}

export async function createFoodItem(itemData: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<FoodItem> {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...itemData,
      active: itemData.active ? 1 : 0
    }),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Failed to create food item');
  }

  return {
    ...responseData,
    active: responseData.active === 1 || responseData.active === true
  };
}

export async function updateFoodItem(
  id: string,
  itemData: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<FoodItem> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...itemData,
      active: itemData.active ? 1 : 0
    }),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Failed to update food item');
  }

  return {
    ...responseData,
    active: responseData.active === 1 || responseData.active === true
  };
}

export async function deleteFoodItem(id: string): Promise<{ message: string }> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Failed to delete food item');
  }

  return responseData;
}
