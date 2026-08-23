import { Request, Response } from 'express';
import prisma from '../config/database';
import { BookingStatus, EventStatus } from '@prisma/client';

export class CalendarController {
  async getCalendarEvents(req: Request, res: Response) {
    try {
      const { start, end } = req.query;

      if (!start || !end) {
        return res.status(400).json({ message: 'Start and end query parameters are required.' });
      }

      const startDate = new Date(String(start));
      const endDate = new Date(String(end));

      // 1. Fetch Events
      const events = await prisma.event.findMany({
        where: {
          deletedAt: null,
          eventDate: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          customer: {
            select: {
              fullName: true
            }
          }
        }
      });

      // 2. Fetch Bookings
      const bookings = await prisma.booking.findMany({
        where: {
          eventDate: {
            gte: startDate,
            lte: endDate
          },
          status: {
            not: BookingStatus.CANCELLED
          }
        },
        include: {
          customer: {
            select: {
              fullName: true
            }
          },
          hall: {
            select: {
              name: true
            }
          }
        }
      });

      // 3. Fetch Legacy Hall Bookings (to ensure we capture all hall occupancy)
      const hallBookings = await prisma.hallBooking.findMany({
        where: {
          status: {
            not: 'Cancelled'
          }
        }
      });

      // Format outputs for FullCalendar / generic calendar representation
      const calendarItems: any[] = [];

      // Add Events
      events.forEach(evt => {
        calendarItems.push({
          id: `evt-${evt.id}`,
          title: `Event: ${evt.eventName}`,
          start: evt.eventDate.toISOString().split('T')[0],
          type: 'event',
          status: evt.status, // PLANNING, CONFIRMED, etc.
          color: '#ca8a04', // Gold
          extendedProps: {
            description: evt.description || '',
            client: evt.customer?.fullName || 'N/A',
            startTime: evt.startTime || 'N/A',
            endTime: evt.endTime || 'N/A',
            expectedGuests: evt.expectedGuestCount || 0
          }
        });
      });

      // Add Bookings
      bookings.forEach(b => {
        calendarItems.push({
          id: `bkg-${b.id}`,
          title: `Booking: ${b.bookingNumber} (${b.hall?.name || 'Hall'})`,
          start: b.eventDate ? b.eventDate.toISOString().split('T')[0] : '',
          type: 'booking',
          status: b.status,
          color: '#1e3a8a', // Dark blue
          extendedProps: {
            client: b.customer?.fullName || 'N/A',
            hall: b.hall?.name || 'N/A',
            startTime: b.startTime || 'N/A',
            endTime: b.endTime || 'N/A',
            guestsCount: b.guestCount || 0,
            amount: b.totalAmount
          }
        });
      });

      // Add Hall Bookings (filter locally for date range)
      hallBookings.forEach(hb => {
        const hbDate = new Date(hb.eventDate);
        if (hbDate >= startDate && hbDate <= endDate) {
          // Avoid duplicating if we already added a booking with the same event ID or similar
          const exists = calendarItems.some(item => item.id === `bkg-${hb.eventId}` || item.id === `evt-${hb.eventId}`);
          if (!exists) {
            calendarItems.push({
              id: `hb-${hb.id}`,
              title: `Hall Booking: ${hb.hallName}`,
              start: hb.eventDate,
              type: 'hall_booking',
              status: hb.status === 'Confirmed' ? 'CONFIRMED' : 'PENDING',
              color: '#0d9488', // Teal
              extendedProps: {
                client: hb.customerName,
                hall: hb.hallName,
                startTime: hb.startTime || 'N/A',
                endTime: hb.endTime || 'N/A',
                guestsCount: hb.guestsCount || 0,
                amount: hb.totalAmount
              }
            });
          }
        }
      });

      return res.status(200).json(calendarItems);
    } catch (error: any) {
      console.error('Get calendar events error:', error);
      return res.status(500).json({ message: 'Internal server error while fetching calendar events.' });
    }
  }
}
