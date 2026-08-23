import { TaskRepository } from '../repositories/task.repository';
import { NotificationService } from './notification.service';
import { Task, TaskStatus, Priority } from '@prisma/client';
import prisma from '../config/database';

export class TaskService {
  private taskRepo = new TaskRepository();

  async getAll(filters: { search?: string; assignedTo?: string; eventId?: string; status?: string; priority?: string } = {}): Promise<Task[]> {
    const status = filters.status ? (filters.status as TaskStatus) : undefined;
    const priority = filters.priority ? (filters.priority as Priority) : undefined;
    return await this.taskRepo.findAll({
      search: filters.search,
      assignedTo: filters.assignedTo,
      eventId: filters.eventId,
      status,
      priority
    });
  }

  async getById(id: string): Promise<Task> {
    const task = await this.taskRepo.findById(id);
    if (!task) throw new Error('TASK_NOT_FOUND');
    return task;
  }

  async create(data: {
    eventId?: string;
    assignedTo?: string;
    title: string;
    description?: string;
    priority?: string;
    dueDate?: string;
  }): Promise<Task> {
    const priority = data.priority ? (data.priority as Priority) : Priority.MEDIUM;
    const task = await this.taskRepo.create({
      title: data.title,
      description: data.description || null,
      priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status: TaskStatus.TODO,
      eventId: data.eventId || null,
      assignedTo: data.assignedTo || null
    });

    if (data.assignedTo) {
      const emp = await prisma.employee.findUnique({
        where: { id: data.assignedTo },
        include: { user: true }
      });
      await NotificationService.createNotification(
        'Task Assigned',
        `New task "${data.title}" assigned to coordinator "${emp?.user?.name || 'Staff Member'}".`,
        'info'
      );
    }

    return task;
  }

  async update(
    id: string,
    data: {
      eventId?: string;
      assignedTo?: string;
      title: string;
      description?: string;
      priority?: string;
      dueDate?: string;
      status?: string;
      completedAt?: string;
    }
  ): Promise<Task> {
    const priority = data.priority ? (data.priority as Priority) : undefined;
    const status = data.status ? (data.status as TaskStatus) : undefined;
    const completedAt = data.status === 'COMPLETED' ? new Date() : undefined;

    const task = await this.taskRepo.update(id, {
      title: data.title,
      description: data.description || null,
      priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status,
      completedAt,
      event: data.eventId ? { connect: { id: data.eventId } } : { disconnect: true },
      assigned: data.assignedTo ? { connect: { id: data.assignedTo } } : { disconnect: true }
    });

    if (status) {
      const empName = task.assignedTo
        ? (await prisma.employee.findUnique({
            where: { id: task.assignedTo },
            include: { user: true }
          }))?.user?.name
        : 'Coordinator';

      await NotificationService.createNotification(
        'Employee Task Update',
        `Task "${task.title}" updated to status ${status} by ${empName}.`,
        status === 'COMPLETED' ? 'success' : 'info'
      );
    }

    return task;
  }

  async delete(id: string): Promise<Task> {
    return await this.taskRepo.delete(id);
  }
}
export default TaskService;
