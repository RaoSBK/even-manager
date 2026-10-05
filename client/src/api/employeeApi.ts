import { httpClient } from './httpClient';

export interface EmployeePayload {
  name: string;
  email: string;
  phone: string;
  department?: string;
  designation?: string;
  joiningDate?: string;
  salary?: number;
  emergencyContact?: string;
  address?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';
  password?: string;
}

export interface Employee {
  id: string;
  userId: string | null;
  employeeCode: string;
  department: string | null;
  designation: string | null;
  joiningDate: string | null;
  salary: number | null;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';
  emergencyContact: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    mobile: string;
    isActive: boolean;
  } | null;
  tasks?: any[];
  eventPlans?: any[];
}

export const employeeApi = {
  getAll: async (search?: string): Promise<Employee[]> => {
    return httpClient.get<Employee[]>('/users/employees', { search });
  },

  getById: async (id: string): Promise<Employee> => {
    return httpClient.get<Employee>(`/users/employees/${id}`);
  },

  create: async (payload: EmployeePayload): Promise<{ message: string; employee: Employee }> => {
    return httpClient.post('/users/employees', payload);
  },

  update: async (id: string, payload: Partial<EmployeePayload>): Promise<{ message: string; employee: Employee }> => {
    return httpClient.put(`/users/employees/${id}`, payload);
  },

  toggleActive: async (id: string): Promise<{ message: string; isActive: boolean }> => {
    return httpClient.patch(`/users/employees/${id}/toggle-active`);
  },

  changePassword: async (id: string, payload: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<{ message: string }> => {
    return httpClient.patch(`/users/employees/${id}/change-password`, payload);
  },
};
