import { PrismaClient, Task, TaskStatus, Priority, Prisma } from '@prisma/client';
import prisma from '../config/database';

export class TaskRepository {
  async findAll(filters: { search?: string; assignedTo?: string; eventId?: string; status?: TaskStatus; priority?: Priority } = {}): Promise<Task[]> {
    const where: Prisma.TaskWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.assignedTo) {
      where.assignedTo = filters.assignedTo;
    }

    if (filters.eventId) {
      where.eventId = filters.eventId;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    return await prisma.task.findMany({
      where,
      include: {
        assigned: {
          include: {
            user: true
          }
        },
        event: true
      },
      orderBy: { dueDate: 'asc' }
    });
  }

  async findById(id: string): Promise<Task | null> {
    return await prisma.task.findUnique({
      where: { id },
      include: {
        assigned: {
          include: {
            user: true
          }
        },
        event: true
      }
    });
  }

  async create(data: Prisma.TaskUncheckedCreateInput): Promise<Task> {
    return await prisma.task.create({ data });
  }

  async update(id: string, data: Prisma.TaskUpdateInput): Promise<Task> {
    return await prisma.task.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<Task> {
    return await prisma.task.delete({
      where: { id }
    });
  }
}
