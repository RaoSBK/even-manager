import { Request, Response } from 'express';
import prisma from '../config/database';

export class SearchController {
  search = async (req: Request, res: Response): Promise<void> => {
    try {
      const q = req.query.q as string;
      if (!q) {
        res.status(200).json({
          customers: [],
          employees: [],
          events: [],
          bookings: [],
          vendors: [],
          halls: [],
          invoices: [],
          quotations: []
        });
        return;
      }

      const [customers, employees, events, bookings, vendors, halls, invoices, quotations] = await Promise.all([
        prisma.customer.findMany({
          where: {
            OR: [
              { fullName: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
              { phone: { contains: q } }
            ]
          },
          take: 10
        }),
        prisma.employee.findMany({
          where: {
            OR: [
              { user: { name: { contains: q, mode: 'insensitive' } } },
              { user: { email: { contains: q, mode: 'insensitive' } } },
              { employeeCode: { contains: q, mode: 'insensitive' } }
            ]
          },
          include: { user: true },
          take: 10
        }),
        prisma.event.findMany({
          where: {
            OR: [
              { eventName: { contains: q, mode: 'insensitive' } },
              { eventCode: { contains: q, mode: 'insensitive' } }
            ]
          },
          take: 10
        }),
        prisma.booking.findMany({
          where: {
            OR: [
              { bookingNumber: { contains: q, mode: 'insensitive' } },
              { eventType: { contains: q, mode: 'insensitive' } }
            ]
          },
          take: 10
        }),
        prisma.vendor.findMany({
          where: {
            deletedAt: null,
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { vendorCode: { contains: q, mode: 'insensitive' } }
            ]
          },
          take: 10
        }),
        prisma.hall.findMany({
          where: {
            deletedAt: null,
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { hallCode: { contains: q, mode: 'insensitive' } }
            ]
          },
          take: 10
        }),
        prisma.invoice.findMany({
          where: {
            OR: [
              { invoiceNumber: { contains: q, mode: 'insensitive' } }
            ]
          },
          take: 10
        }),
        prisma.quotation.findMany({
          where: {
            OR: [
              { quotationNumber: { contains: q, mode: 'insensitive' } }
            ]
          },
          take: 10
        })
      ]);

      res.status(200).json({
        customers,
        employees,
        events,
        bookings,
        vendors,
        halls,
        invoices,
        quotations
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };
}
export default SearchController;
