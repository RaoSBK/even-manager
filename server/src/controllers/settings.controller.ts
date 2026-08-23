import { Request, Response } from 'express';
import { SettingsService } from '../services/settings.service';

export class SettingsController {
  private settingsService = new SettingsService();

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const config = await this.settingsService.getAll();
      res.status(200).json(config);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.settingsService.update(req.body);
      res.status(200).json({ message: 'SETTINGS_UPDATED_SUCCESSFULLY' });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };
}
export default SettingsController;
