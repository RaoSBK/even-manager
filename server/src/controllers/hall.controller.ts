import { Request, Response } from 'express';
import { HallService } from '../services/hall.service';
import { HallStatus } from '@prisma/client';

export class HallController {
  private hallService = new HallService();

  /**
   * Check hall availability for a given date and optional times
   */
  async getAvailability(req: Request, res: Response) {
    try {
      const { date, startTime, endTime } = req.query;

      if (!date || typeof date !== 'string') {
        return res.status(400).json({ message: 'Query parameter "date" in YYYY-MM-DD format is required.' });
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
      }

      if (startTime && endTime && typeof startTime === 'string' && typeof endTime === 'string') {
        if (startTime >= endTime) {
          return res.status(400).json({ message: 'End time must be after start time.' });
        }
      }

      const hallsAvailability = await this.hallService.checkAvailability(
        date,
        typeof startTime === 'string' ? startTime : undefined,
        typeof endTime === 'string' ? endTime : undefined
      );

      return res.status(200).json({
        date,
        halls: hallsAvailability
      });
    } catch (error: any) {
      console.error('Get availability controller error:', error);
      return res.status(500).json({ message: 'Internal server error while checking availability.' });
    }
  }

  /**
   * CRUD
   */
  async getHalls(req: Request, res: Response) {
    try {
      const halls = await this.hallService.getHalls();
      return res.status(200).json(halls);
    } catch (error: any) {
      console.error('Get halls error:', error);
      return res.status(500).json({ message: 'Internal server error while fetching halls.' });
    }
  }

  async getHallById(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const hall = await this.hallService.getHallById(id);
      return res.status(200).json(hall);
    } catch (error: any) {
      if (error.message === 'HALL_NOT_FOUND') {
        return res.status(404).json({ message: 'Hall not found.' });
      }
      console.error('Get hall by id error:', error);
      return res.status(500).json({ message: 'Internal server error while fetching hall details.' });
    }
  }

  async createHall(req: Request, res: Response) {
    try {
      const { name, description, location, state, district, mandal, capacity, basePrice, status } = req.body;

      if (!name || capacity === undefined || basePrice === undefined) {
        return res.status(400).json({ message: 'Name, capacity, and base price are required.' });
      }

      const hall = await this.hallService.createHall({
        name,
        description,
        location,
        state,
        district,
        mandal,
        capacity,
        basePrice,
        status: status as HallStatus
      });

      return res.status(201).json({
        message: 'Hall created successfully.',
        hall
      });
    } catch (error: any) {
      console.error('Create hall error:', error);
      return res.status(500).json({ message: 'Internal server error while creating hall.' });
    }
  }

  async updateHall(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const hall = await this.hallService.updateHall(id, req.body);
      return res.status(200).json({
        message: 'Hall updated successfully.',
        hall
      });
    } catch (error: any) {
      if (error.message === 'HALL_NOT_FOUND') {
        return res.status(404).json({ message: 'Hall not found.' });
      }
      console.error('Update hall error:', error);
      return res.status(500).json({ message: 'Internal server error while updating hall.' });
    }
  }

  async deleteHall(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      await this.hallService.deleteHall(id);
      return res.status(200).json({ message: 'Hall deleted/deactivated successfully.' });
    } catch (error: any) {
      if (error.message === 'HALL_NOT_FOUND') {
        return res.status(404).json({ message: 'Hall not found.' });
      }
      console.error('Delete hall error:', error);
      return res.status(500).json({ message: 'Internal server error while deleting hall.' });
    }
  }

  async getHallBookings(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const { start, end } = req.query;

      if (!start || !end) {
        return res.status(400).json({ message: 'Start and end date range is required.' });
      }

      const bookings = await this.hallService.getHallBookings(id, String(start), String(end));
      return res.status(200).json(bookings);
    } catch (error: any) {
      console.error('Get hall bookings calendar error:', error);
      return res.status(500).json({ message: 'Internal server error while fetching hall calendar bookings.' });
    }
  }
}
