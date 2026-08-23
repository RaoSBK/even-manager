import { Request, Response } from 'express';
import { InventoryService } from '../services/inventory.service';

export class InventoryController {
  private inventoryService = new InventoryService();

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters = {
        search: req.query.search as string,
        category: req.query.category as string,
        status: req.query.status as string
      };
      const list = await this.inventoryService.getAll(filters);
      res.status(200).json(list);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const item = await this.inventoryService.getById(req.params.id as string);
      res.status(200).json(item);
    } catch (err: any) {
      res.status(404).json({ message: err.message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const item = await this.inventoryService.create(req.body);
      res.status(201).json(item);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const item = await this.inventoryService.update(req.params.id as string, req.body);
      res.status(200).json(item);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  updateQuantity = async (req: Request, res: Response): Promise<void> => {
    try {
      const item = await this.inventoryService.updateQuantity(req.params.id as string, req.body);
      res.status(200).json(item);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const item = await this.inventoryService.delete(req.params.id as string);
      res.status(200).json(item);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  getSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const summary = await this.inventoryService.getSummary();
      res.status(200).json(summary);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  getTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
      const list = await this.inventoryService.getTransactions(req.params.id as string);
      res.status(200).json(list);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };
}
export default InventoryController;
