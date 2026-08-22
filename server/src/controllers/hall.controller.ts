import { Request, Response } from 'express';
import { HallService } from '../services/hall.service';

export class HallController {
  private hallService = new HallService();

  /**
   * Get hall availability for a given date and optional times
   */
  async getAvailability(req: Request, res: Response) {
    try {
      const { date, startTime, endTime } = req.query;

      if (!date || typeof date !== 'string') {
        return res.status(400).json({ message: 'Query parameter "date" in YYYY-MM-DD format is required.' });
      }

      // Regex validation for YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
      }

      // Time range order check if both provided
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
}
