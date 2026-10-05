import { Request, Response } from 'express';
import prisma from '../config/database';
import { BookingStatus, EventStatus, HallStatus } from '@prisma/client';

export class ReportController {
  async getDashboardOverview(req: Request, res: Response) {
    try {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const next30Days = new Date();
      next30Days.setDate(today.getDate() + 30);
      next30Days.setUTCHours(23, 59, 59, 999);

      // 1. Events Counts
      const totalEvents = await prisma.event.count({
        where: { deletedAt: null }
      });

      const upcomingEvents = await prisma.event.count({
        where: {
          deletedAt: null,
          eventDate: {
            gte: today,
            lte: next30Days
          }
        }
      });

      // 2. Bookings Counts
      const totalBookings = await prisma.booking.count({});
      const pendingBookings = await prisma.booking.count({
        where: {
          status: {
            in: [BookingStatus.PENDING, BookingStatus.PENDING_PAYMENT]
          }
        }
      });
      const confirmedBookings = await prisma.booking.count({
        where: { status: BookingStatus.CONFIRMED }
      });

      // 3. User Counts
      const totalCustomers = await prisma.customer.count({
        where: { deletedAt: null }
      });
      const totalEmployees = await prisma.employee.count({
        where: { deletedAt: null }
      });
      const totalVendors = await prisma.vendor.count({
        where: { deletedAt: null }
      });

      // 4. Hall Counts (Available / Occupied today)
      const allHalls = await prisma.hall.count({
        where: { deletedAt: null, status: HallStatus.AVAILABLE }
      });

      const startOfToday = new Date();
      startOfToday.setUTCHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setUTCHours(23, 59, 59, 999);

      const occupiedHallsCount = await prisma.booking.count({
        where: {
          eventDate: {
            gte: startOfToday,
            lte: endOfToday
          },
          status: {
            in: [BookingStatus.PENDING, BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS]
          }
        }
      });

      const availableHalls = Math.max(0, allHalls - occupiedHallsCount);
      const occupiedHalls = occupiedHallsCount;

      // 5. Payments / Revenue
      // Pending Payments: Sum of balanceAmount for all PENDING/CONFIRMED bookings
      const pendingPaymentsSum = await prisma.booking.aggregate({
        where: {
          status: {
            in: [BookingStatus.PENDING, BookingStatus.CONFIRMED]
          }
        },
        _sum: {
          balanceAmount: true
        }
      });

      // Total Revenue: Sum of totalAmount for all CONFIRMED/COMPLETED bookings
      const revenueSum = await prisma.booking.aggregate({
        where: {
          status: {
            in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED]
          }
        },
        _sum: {
          totalAmount: true
        }
      });

      // Also let's check legacy HallBooking totals in case bookings are registered there
      const legacyRevenueSum = await prisma.hallBooking.aggregate({
        where: {
          status: {
            in: ['Confirmed', 'Completed']
          }
        },
        _sum: {
          totalAmount: true
        }
      });

      const pendingPayments = Number(pendingPaymentsSum._sum.balanceAmount || 0);
      const totalRevenue = Math.max(
        Number(revenueSum._sum.totalAmount || 0),
        Number(legacyRevenueSum._sum.totalAmount || 0)
      );

      return res.status(200).json({
        totalEvents,
        upcomingEvents,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        totalCustomers,
        totalEmployees,
        totalVendors,
        availableHalls,
        occupiedHalls,
        pendingPayments,
        totalRevenue
      });
    } catch (error: any) {
      console.error('Get dashboard overview error:', error);
      return res.status(500).json({ message: 'Internal server error while compiling dashboard overview statistics.' });
    }
  }
}
