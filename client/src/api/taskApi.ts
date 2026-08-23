import { httpClient } from './httpClient';
import { Employee } from './employeeApi';
import { EventDetails } from './eventApi';

export interface Task {
  id: string;
  eventId?: string;
  assignedTo?: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  assigned?: Employee;
  event?: EventDetails;
}

export const taskApi = {
  getAll: (filters: { search?: string; assignedTo?: string; eventId?: string; status?: string; priority?: string } = {}) =>
    httpClient.get<Task[]>('/tasks', filters),

  getById: (id: string) =>
    httpClient.get<Task>(`/tasks/${id}`),

  create: (data: Partial<Task>) =>
    httpClient.post<Task>('/tasks', data),

  update: (id: string, data: Partial<Task>) =>
    httpClient.put<Task>(`/tasks/${id}`, data),

  delete: (id: string) =>
    httpClient.delete<Task>(`/tasks/${id}`)
};
export default taskApi;
