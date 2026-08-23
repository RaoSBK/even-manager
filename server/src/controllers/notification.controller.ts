import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';

export class NotificationController {
  private notificationService = new NotificationService();

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const list = await this.notificationService.getAll();
      res.status(200).json(list);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  markRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const notif = await this.notificationService.markRead(req.params.id as string);
      res.status(200).json(notif);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  markAllRead = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.notificationService.markAllRead();
      res.status(200).json({ message: 'ALL_MARKED_READ' });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  clearAll = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.notificationService.clearAll();
      res.status(200).json({ message: 'ALL_CLEARED' });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };
}
export default NotificationController;
