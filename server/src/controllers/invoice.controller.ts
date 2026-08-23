import { Request, Response } from 'express';
import { InvoiceService } from '../services/invoice.service';

export class InvoiceController {
  private invoiceService = new InvoiceService();

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters = {
        search: req.query.search as string,
        bookingId: req.query.bookingId as string,
        customerId: req.query.customerId as string,
        status: req.query.status as string
      };
      const list = await this.invoiceService.getAll(filters);
      res.status(200).json(list);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const invoice = await this.invoiceService.getById(req.params.id as string);
      res.status(200).json(invoice);
    } catch (err: any) {
      res.status(404).json({ message: err.message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const invoice = await this.invoiceService.create(req.body);
      res.status(201).json(invoice);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const invoice = await this.invoiceService.updateStatus(req.params.id as string, req.body.status as string);
      res.status(200).json(invoice);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };
}
export default InvoiceController;
