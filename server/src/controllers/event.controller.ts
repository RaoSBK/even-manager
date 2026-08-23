import { Request, Response } from 'express';
import { EventService } from '../services/event.service';
import { EventStatus } from '@prisma/client';

export class EventController {
  private eventService = new EventService();

  async getEvents(req: Request, res: Response) {
    try {
      const { search, status } = req.query;
      const filters: any = {};
      
      if (search) filters.search = String(search);
      if (status) filters.status = status as EventStatus;

      const events = await this.eventService.getEvents(filters);
      return res.status(200).json(events);
    } catch (error: any) {
      console.error('Get events controller error:', error);
      return res.status(500).json({ message: 'Internal server error while fetching events' });
    }
  }

  async getEventById(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const event = await this.eventService.getEventById(id);
      return res.status(200).json(event);
    } catch (error: any) {
      if (error.message === 'EVENT_NOT_FOUND') {
        return res.status(404).json({ message: 'Event not found' });
      }
      console.error('Get event by id controller error:', error);
      return res.status(500).json({ message: 'Internal server error while fetching event' });
    }
  }

  async createEvent(req: Request, res: Response) {
    try {
      const { customerId, eventName, eventType, description, eventDate, startTime, endTime, expectedGuestCount, budget, notes, hallId, coordinatorIds } = req.body;

      if (!customerId || !eventName || !eventType || !eventDate) {
        return res.status(400).json({ message: 'Customer, Event Name, Event Type, and Event Date are required' });
      }

      const event = await this.eventService.createEvent({
        customerId,
        eventName,
        eventType,
        description,
        eventDate,
        startTime,
        endTime,
        expectedGuestCount,
        budget,
        notes,
        hallId,
        coordinatorIds
      });

      return res.status(201).json({
        message: 'Event planned and created successfully',
        event
      });
    } catch (error: any) {
      if (error.message === 'CUSTOMER_NOT_FOUND') {
        return res.status(400).json({ message: 'Assigned customer profile not found' });
      }
      if (error.message === 'HALL_NOT_FOUND') {
        return res.status(400).json({ message: 'Assigned function hall not found' });
      }
      console.error('Create event controller error:', error);
      return res.status(500).json({ message: 'Internal server error while planning event' });
    }
  }

  async updateEvent(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const event = await this.eventService.updateEvent(id, req.body);
      return res.status(200).json({
        message: 'Event updated successfully',
        event
      });
    } catch (error: any) {
      if (error.message === 'EVENT_NOT_FOUND') {
        return res.status(404).json({ message: 'Event not found' });
      }
      console.error('Update event controller error:', error);
      return res.status(500).json({ message: 'Internal server error while updating event details' });
    }
  }

  async cancelEvent(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const event = await this.eventService.cancelEvent(id);
      return res.status(200).json({
        message: 'Event cancelled successfully',
        event
      });
    } catch (error: any) {
      if (error.message === 'EVENT_NOT_FOUND') {
        return res.status(404).json({ message: 'Event not found' });
      }
      console.error('Cancel event controller error:', error);
      return res.status(500).json({ message: 'Internal server error while cancelling event' });
    }
  }

  /**
   * Event tasks
   */
  async createTask(req: Request, res: Response) {
    try {
      const { id: eventId } = req.params as { id: string };
      const { title, description, assignedTo, priority, dueDate } = req.body;

      if (!title) {
        return res.status(400).json({ message: 'Task title is required' });
      }

      const task = await this.eventService.createTask(eventId, {
        title,
        description,
        assignedTo,
        priority,
        dueDate
      });

      return res.status(201).json({
        message: 'Task added successfully',
        task
      });
    } catch (error: any) {
      console.error('Create event task error:', error);
      return res.status(500).json({ message: 'Internal server error while creating task' });
    }
  }

  async updateTask(req: Request, res: Response) {
    try {
      const { taskId } = req.params as { taskId: string };
      const task = await this.eventService.updateTask(taskId, req.body);
      return res.status(200).json({
        message: 'Task updated successfully',
        task
      });
    } catch (error: any) {
      console.error('Update task error:', error);
      return res.status(500).json({ message: 'Internal server error while updating task' });
    }
  }

  async deleteTask(req: Request, res: Response) {
    try {
      const { taskId } = req.params as { taskId: string };
      await this.eventService.deleteTask(taskId);
      return res.status(200).json({
        message: 'Task deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete task error:', error);
      return res.status(500).json({ message: 'Internal server error while deleting task' });
    }
  }
}
