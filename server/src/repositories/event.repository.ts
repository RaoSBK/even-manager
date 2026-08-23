import { PrismaClient, Event, EventStatus, Prisma, Task } from '@prisma/client';
import prisma from '../config/database';

export class EventRepository {
  async findAll(filters?: { search?: string; status?: EventStatus }): Promise<any[]> {
    const whereClause: Prisma.EventWhereInput = {
      deletedAt: null,
    };

    if (filters?.status) {
      whereClause.status = filters.status;
    }

    if (filters?.search) {
      whereClause.OR = [
        { eventName: { contains: filters.search, mode: 'insensitive' } },
        { eventCode: { contains: filters.search, mode: 'insensitive' } },
        { customer: { fullName: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    return await prisma.event.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        booking: {
          include: {
            hall: true,
          },
        },
        tasks: {
          include: {
            assigned: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        eventDate: 'desc',
      },
    });
  }

  async findById(id: string): Promise<any | null> {
    return await prisma.event.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        booking: {
          include: {
            hall: true,
          },
        },
        eventTimelines: {
          orderBy: {
            startAt: 'asc',
          },
        },
        tasks: {
          include: {
            assigned: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            dueDate: 'asc',
          },
        },
      },
    });
  }

  async create(data: Prisma.EventUncheckedCreateInput): Promise<Event> {
    return await prisma.event.create({
      data,
    });
  }

  async update(id: string, data: Prisma.EventUpdateInput): Promise<Event> {
    return await prisma.event.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Event> {
    return await prisma.event.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Event Timeline Methods
   */
  async createTimeline(data: Prisma.EventTimelineUncheckedCreateInput) {
    return await prisma.eventTimeline.create({
      data,
    });
  }

  async deleteTimelines(eventId: string) {
    return await prisma.eventTimeline.deleteMany({
      where: { eventId },
    });
  }

  /**
   * Tasks Methods
   */
  async createTask(data: Prisma.TaskUncheckedCreateInput): Promise<Task> {
    return await prisma.task.create({
      data,
    });
  }

  async updateTask(id: string, data: Prisma.TaskUpdateInput): Promise<Task> {
    return await prisma.task.update({
      where: { id },
      data,
    });
  }

  async deleteTask(id: string): Promise<Task> {
    return await prisma.task.delete({
      where: { id },
    });
  }
}
