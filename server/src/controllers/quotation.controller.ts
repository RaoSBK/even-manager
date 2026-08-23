import { Request, Response } from 'express';
import { QuotationService } from '../services/quotation.service';

export class QuotationController {
  private quotationService = new QuotationService();

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters = {
        search: req.query.search as string,
        customerId: req.query.customerId as string,
        status: req.query.status as string
      };
      const list = await this.quotationService.getAll(filters);
      res.status(200).json(list);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const quotation = await this.quotationService.getById(req.params.id as string);
      res.status(200).json(quotation);
    } catch (err: any) {
      res.status(404).json({ message: err.message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const quotation = await this.quotationService.create(req.body);
      res.status(201).json(quotation);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const quotation = await this.quotationService.update(req.params.id as string, req.body);
      res.status(200).json(quotation);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const quotation = await this.quotationService.updateStatus(req.params.id as string, req.body.status as string);
      res.status(200).json(quotation);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };
}
export default QuotationController;
