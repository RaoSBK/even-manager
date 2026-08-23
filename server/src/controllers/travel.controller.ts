import { Request, Response } from 'express';
import { TravelService } from '../services/travel.service';

export class TravelController {
  private travelService = new TravelService();

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters = {
        search: req.query.search as string,
        eventId: req.query.eventId as string,
        customerId: req.query.customerId as string,
        status: req.query.status as string
      };
      const list = await this.travelService.getAll(filters);
      res.status(200).json(list);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const travel = await this.travelService.getById(req.params.id as string);
      res.status(200).json(travel);
    } catch (err: any) {
      res.status(404).json({ message: err.message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const travel = await this.travelService.create(req.body);
      res.status(201).json(travel);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const travel = await this.travelService.update(req.params.id as string, req.body);
      res.status(200).json(travel);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const travel = await this.travelService.delete(req.params.id as string);
      res.status(200).json(travel);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };
}
export default TravelController;
