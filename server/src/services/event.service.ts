import { EventRepository } from '../repositories/event.repository';
import prisma from '../config/database';
import { Event, EventStatus, Task, TaskStatus, Priority, BookingStatus } from '@prisma/client';

export class EventService {
  private eventRepo = new EventRepository();

  private generateEventCode(eventDate: Date): string {
    const year = eventDate.getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `EVT-${year}-${random}`;
  }

  private generateBookingNumber(): string {
    return 'BK-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }

  async getEvents(filters?: { search?: string; status?: EventStatus }): Promise<any[]> {
    return await this.eventRepo.findAll(filters);
  }

  async getEventById(id: string): Promise<any> {
    const event = await this.eventRepo.findById(id);
    if (!event) throw new Error('EVENT_NOT_FOUND');
    return event;
  }

  async createEvent(data: {
    customerId: string;
    eventName: string;
    eventType: string;
    description?: string;
    eventDate: string;
    startTime?: string;
    endTime?: string;
    expectedGuestCount?: number;
    budget?: number;
    notes?: string;
    hallId?: string;
    coordinatorIds?: string[]; // Employees assigned as coordinators
  }): Promise<Event> {
    const parsedDate = new Date(data.eventDate);
    const eventCode = this.generateEventCode(parsedDate);

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
      include: { user: true }
    });
    if (!customer) throw new Error('CUSTOMER_NOT_FOUND');

    return await prisma.$transaction(async (tx) => {
      // 1. Create the Event
      const event = await tx.event.create({
        data: {
          eventCode,
          customerId: data.customerId,
          eventName: data.eventName,
          eventType: data.eventType,
          description: data.description || null,
          eventDate: parsedDate,
          startTime: data.startTime || null,
          endTime: data.endTime || null,
          expectedGuestCount: data.expectedGuestCount ? Number(data.expectedGuestCount) : null,
          budget: data.budget ? Number(data.budget) : null,
          notes: data.notes || null,
          status: 'PLANNING'
        }
      });

      // 2. Create associated booking if a hall is assigned
      if (data.hallId) {
        const hall = await tx.hall.findUnique({ where: { id: data.hallId } });
        if (!hall) throw new Error('HALL_NOT_FOUND');

        const bookingNumber = this.generateBookingNumber();
        await tx.booking.create({
          data: {
            bookingNumber,
            eventId: event.id,
            customerId: customer.id,
            userId: customer.userId || null,
            hallId: data.hallId,
            eventType: data.eventType,
            eventDate: parsedDate,
            startTime: data.startTime || null,
            endTime: data.endTime || null,
            guestCount: data.expectedGuestCount ? Number(data.expectedGuestCount) : null,
            status: BookingStatus.CONFIRMED, // When admin creates event with hall, it's confirmed
            totalAmount: hall.basePrice,
            advanceAmount: 0,
            balanceAmount: hall.basePrice
          }
        });

        // Also create a legacy HallBooking
        const bookingDate = new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
        await tx.hallBooking.create({
          data: {
            id: 'GK-HALL-' + Math.floor(100000 + Math.random() * 900000),
            userId: customer.userId || 'admin',
            customerName: customer.fullName,
            email: customer.email,
            mobile: customer.phone,
            state: customer.state || 'N/A',
            district: customer.city || 'N/A',
            mandal: 'N/A',
            hallId: hall.id,
            hallName: hall.name,
            hallAddress: hall.location || '',
            eventDate: data.eventDate,
            bookingDate,
            costPerDay: Number(hall.basePrice),
            totalAmount: Number(hall.basePrice),
            status: 'Confirmed',
            eventType: data.eventType,
            guestsCount: data.expectedGuestCount ? Number(data.expectedGuestCount) : 100,
            eventSession: 'Full Day',
            foodItems: '[]',
            paymentStatus: 'Pending',
            eventId: event.id
          }
        });
      }

      // 3. Create task assignments for coordinators
      if (data.coordinatorIds && data.coordinatorIds.length > 0) {
        for (const empId of data.coordinatorIds) {
          await tx.task.create({
            data: {
              eventId: event.id,
              assignedTo: empId,
              title: `Coordinate Event: ${data.eventName}`,
              description: `Manage and coordinate setup, catering, and execution of the event on ${data.eventDate}`,
              priority: Priority.HIGH,
              status: TaskStatus.TODO,
              dueDate: parsedDate
            }
          });
        }
      }

      return event;
    });
  }

  async updateEvent(id: string, data: any): Promise<Event> {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) throw new Error('EVENT_NOT_FOUND');

    const updateData: any = {
      eventName: data.eventName,
      eventType: data.eventType,
      description: data.description,
      expectedGuestCount: data.expectedGuestCount ? Number(data.expectedGuestCount) : undefined,
      budget: data.budget ? Number(data.budget) : undefined,
      notes: data.notes,
      status: data.status
    };

    if (data.eventDate) {
      updateData.eventDate = new Date(data.eventDate);
    }
    if (data.startTime !== undefined) updateData.startTime = data.startTime;
    if (data.endTime !== undefined) updateData.endTime = data.endTime;

    return await prisma.$transaction(async (tx) => {
      const updatedEvent = await tx.event.update({
        where: { id },
        data: updateData
      });

      // Synchronize booking status if event status changes
      if (data.status) {
        let bookingStatus: BookingStatus | null = null;
        if (data.status === 'CANCELLED') bookingStatus = BookingStatus.CANCELLED;
        else if (data.status === 'COMPLETED') bookingStatus = BookingStatus.COMPLETED;
        else if (data.status === 'CONFIRMED' || data.status === 'IN_PROGRESS') bookingStatus = BookingStatus.CONFIRMED;

        if (bookingStatus) {
          await tx.booking.updateMany({
            where: { eventId: id },
            data: { status: bookingStatus }
          });

          // Also legacy HallBooking status
          const legacyStatus = data.status === 'CANCELLED' ? 'Cancelled' : (data.status === 'COMPLETED' ? 'Completed' : 'Confirmed');
          await tx.hallBooking.updateMany({
            where: { eventId: id },
            data: { status: legacyStatus }
          });
        }
      }

      return updatedEvent;
    });
  }

  async cancelEvent(id: string): Promise<Event> {
    return await this.updateEvent(id, { status: 'CANCELLED' });
  }

  /**
   * Tasks CRUD inside events context
   */
  async createTask(eventId: string, data: {
    title: string;
    description?: string;
    assignedTo?: string;
    priority?: Priority;
    dueDate?: string;
  }): Promise<Task> {
    return await this.eventRepo.createTask({
      eventId,
      title: data.title,
      description: data.description || null,
      assignedTo: data.assignedTo || null,
      priority: data.priority || Priority.MEDIUM,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status: TaskStatus.TODO
    });
  }

  async updateTask(taskId: string, data: any): Promise<Task> {
    const updateData: any = {
      title: data.title,
      description: data.description,
      assignedTo: data.assignedTo,
      priority: data.priority,
      status: data.status,
    };
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.status === TaskStatus.COMPLETED) {
      updateData.completedAt = new Date();
    }

    return await this.eventRepo.updateTask(taskId, updateData);
  }

  async deleteTask(taskId: string): Promise<Task> {
    return await this.eventRepo.deleteTask(taskId);
  }
}
