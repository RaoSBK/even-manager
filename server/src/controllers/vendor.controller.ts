import { Request, Response } from 'express';
import { VendorService } from '../services/vendor.service';

export class VendorController {
  private vendorService = new VendorService();

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters = {
        search: req.query.search as string,
        category: req.query.category as string,
        status: req.query.status as string
      };
      const list = await this.vendorService.getAll(filters);
      res.status(200).json(list);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const vendor = await this.vendorService.getById(req.params.id as string);
      res.status(200).json(vendor);
    } catch (err: any) {
      res.status(404).json({ message: err.message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const vendor = await this.vendorService.create(req.body);
      res.status(201).json(vendor);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const vendor = await this.vendorService.update(req.params.id as string, req.body);
      res.status(200).json(vendor);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const vendor = await this.vendorService.delete(req.params.id as string);
      res.status(200).json(vendor);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };
}
export default VendorController;
