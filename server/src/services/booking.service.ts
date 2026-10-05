import { BookingRepository } from '../repositories/booking.repository';
import prisma from '../config/database';
import { Booking, BookingStatus, PaymentStatus, PaymentMethod, InvoiceStatus, Prisma } from '@prisma/client';
import razorpayService from './razorpay.service';
import { NotificationService } from './notification.service';

export class BookingService {
  private bookingRepo = new BookingRepository();

  /**
   * Helper to generate unique booking numbers (GK-XXXXXX)
   */
  private generateBookingNumber(): string {
    return 'GK-' + Math.floor(100000 + Math.random() * 900000);
  }

  private generateInvoiceNumber(): string {
    return 'INV-' + Math.floor(100000 + Math.random() * 900000);
  }

  private generatePaymentNumber(): string {
    return 'PAY-' + Math.floor(100000 + Math.random() * 900000);
  }

  /**
   * Create Pending Booking & Razorpay Order
   */
  async createPendingBooking(
    userId: string,
    data: {
      hallId: string;
      eventType: string;
      eventDate: string; // YYYY-MM-DD
      startTime: string; // HH:MM
      endTime: string; // HH:MM
      guestCount: number;
      selectedServices?: Array<{ id?: string; name: string; price: number }>;
      customerName?: string;
      customerPhone?: string;
      customerEmail?: string;
      customerAddress?: string;
      specialNotes?: string;
      notes?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      district?: string;
      state?: string;
      country?: string;
      pincode?: string;
    }
  ): Promise<any> {
    const {
      hallId,
      eventType,
      eventDate,
      startTime,
      endTime,
      guestCount,
      selectedServices = [],
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      specialNotes,
      notes,
      addressLine1,
      addressLine2,
      city,
      district,
      state,
      country,
      pincode
    } = data;

    // 1. Validations: Date parsing and past check
    const normalizedDate = new Date(eventDate);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (normalizedDate < today) {
      throw new Error('PAST_DATE');
    }

    if (startTime >= endTime) {
      throw new Error('INVALID_TIME_RANGE');
    }

    if (!guestCount || guestCount <= 0) {
      throw new Error('INVALID_GUEST_COUNT');
    }

    // 2. Fetch User & Hall
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    const hall = await prisma.hall.findUnique({ where: { id: hallId } });
    if (!hall) {
      throw new Error('HALL_NOT_FOUND');
    }

    if (hall.status !== 'AVAILABLE') {
      throw new Error('HALL_UNAVAILABLE_STATUS');
    }

    const effectiveCustomerName = customerName || user.name || 'Customer';
    const effectiveEmail = customerEmail || user.email || '';
    const effectivePhone = customerPhone || user.mobile || '';
    const effectiveAddress = customerAddress || [addressLine1, addressLine2, city, district, state, pincode, country].filter(Boolean).join(', ');

    // 3. Backend Price Calculation (Frontend total is NEVER trusted)
    const hallAmount = Number(hall.basePrice);
    const servicesAmount = selectedServices.reduce((sum: number, s: any) => sum + Number(s.price || 0), 0);
    const subtotal = hallAmount + servicesAmount;
    const gstAmount = Math.round(subtotal * 0.18); // 18% GST
    const totalAmount = subtotal + gstAmount;

    // 4. Double booking prevention inside transaction
    const booking = await prisma.$transaction(
      async (tx) => {
        const conflict = await this.bookingRepo.findConflictingBooking(
          tx,
          hallId,
          normalizedDate,
          startTime,
          endTime
        );

        if (conflict) {
          throw new Error('CONFLICT');
        }

        // Find or create customer record
        let customer = await tx.customer.findFirst({
          where: {
            OR: [
              { userId },
              ...(effectiveEmail ? [{ email: effectiveEmail }] : []),
              ...(effectivePhone ? [{ phone: effectivePhone }] : [])
            ]
          }
        });

        if (!customer) {
          customer = await tx.customer.create({
            data: {
              userId,
              fullName: effectiveCustomerName,
              email: effectiveEmail,
              phone: effectivePhone,
              address: effectiveAddress
            }
          });
        }

        const bookingNumber = this.generateBookingNumber();
        const notesCombined = notes || `Notes: ${specialNotes || 'None'}. Address: ${effectiveAddress}. Coordinator: ${effectiveCustomerName} (${effectivePhone}). Services: ${selectedServices.map((s: any) => s.name).join(', ')}`;

        return await tx.booking.create({
          data: {
            bookingNumber,
            userId,
            customerId: customer.id,
            hallId,
            eventType,
            eventDate: normalizedDate,
            startTime,
            endTime,
            guestCount,
            status: BookingStatus.PENDING_PAYMENT,
            paymentStatus: 'PENDING',
            hallAmount,
            servicesAmount,
            gstAmount,
            totalAmount,
            selectedServices: JSON.stringify(selectedServices),
            notes: notesCombined,
            addressLine1: addressLine1 || null,
            addressLine2: addressLine2 || null,
            city: city || null,
            district: district || null,
            state: state || null,
            country: country || null,
            pincode: pincode || null
          },
          include: {
            hall: true,
            user: { select: { id: true, name: true, email: true, mobile: true } }
          }
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable
      }
    );

    // 5. Create Razorpay Order
    const razorpayOrder = await razorpayService.createOrder(
      totalAmount,
      booking.bookingNumber,
      {
        bookingId: booking.id,
        customerName: effectiveCustomerName,
        customerEmail: effectiveEmail,
        customerPhone: effectivePhone
      }
    );

    // Update booking & create pending payment record
    await prisma.booking.update({
      where: { id: booking.id },
      data: { razorpayOrderId: razorpayOrder.id }
    });

    if (booking.customerId) {
      await prisma.payment.create({
        data: {
          paymentNumber: this.generatePaymentNumber(),
          bookingId: booking.id,
          customerId: booking.customerId,
          amount: totalAmount,
          currency: 'INR',
          paymentMethod: PaymentMethod.ONLINE,
          razorpayOrderId: razorpayOrder.id,
          status: PaymentStatus.PENDING
        }
      });
    }

    return {
      booking: {
        ...booking,
        razorpayOrderId: razorpayOrder.id
      },
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: razorpayOrder.key_id
      }
    };
  }

  /**
   * Verify Razorpay Payment Signature and Confirm Booking
   */
  async verifyRazorpayPayment(data: {
    bookingId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

    // 1. Signature Verification using HMAC SHA256
    const isValid = razorpayService.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      throw new Error('INVALID_SIGNATURE');
    }

    // 2. Perform DB updates in transaction
    return await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { hall: true, user: true, customer: true }
      });

      if (!booking) {
        throw new Error('NOT_FOUND');
      }

      // Check if already confirmed
      if (booking.status === BookingStatus.CONFIRMED && booking.paymentStatus === 'PAID') {
        return { message: 'Booking already confirmed', booking };
      }

      // Re-verify availability inside transaction to prevent double booking
      if (booking.hallId && booking.eventDate && booking.startTime && booking.endTime) {
        const conflict = await this.bookingRepo.findConflictingBooking(
          tx,
          booking.hallId,
          booking.eventDate,
          booking.startTime,
          booking.endTime,
          booking.id
        );
        if (conflict) {
          throw new Error('DOUBLE_BOOKING_CONFLICT');
        }
      }

      // Update Booking status to CONFIRMED and paymentStatus to PAID
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CONFIRMED,
          paymentStatus: 'PAID',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          advanceAmount: booking.totalAmount,
          balanceAmount: 0
        },
        include: { hall: true, user: true, customer: true }
      });

      // Update/Create Payment record
      let payment = await tx.payment.findFirst({
        where: { razorpayOrderId: razorpay_order_id }
      });

      if (payment) {
        payment = await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.PAID,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            transactionReference: razorpay_payment_id,
            paidAt: new Date()
          }
        });
      } else if (booking.customerId) {
        payment = await tx.payment.create({
          data: {
            paymentNumber: this.generatePaymentNumber(),
            bookingId: booking.id,
            customerId: booking.customerId,
            amount: booking.totalAmount,
            currency: 'INR',
            paymentMethod: PaymentMethod.ONLINE,
            transactionReference: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            status: PaymentStatus.PAID,
            paidAt: new Date()
          }
        });
      }

      // Create Invoice record if missing
      const invoiceNumber = this.generateInvoiceNumber();
      const hallAmt = Number(booking.hallAmount || booking.totalAmount);
      const servAmt = Number(booking.servicesAmount || 0);
      const gstAmt = Number(booking.gstAmount || 0);
      const totAmt = Number(booking.totalAmount);

      const customerId = booking.customerId || (payment ? payment.customerId : null);

      if (customerId) {
        const existingInvoice = await tx.invoice.findFirst({
          where: { bookingId: booking.id }
        });

        if (!existingInvoice) {
          await tx.invoice.create({
            data: {
              invoiceNumber,
              bookingId: booking.id,
              customerId,
              subtotal: hallAmt + servAmt,
              tax: gstAmt,
              totalAmount: totAmt,
              paidAmount: totAmt,
              balanceAmount: 0,
              status: InvoiceStatus.PAID,
              items: {
                create: [
                  {
                    description: `Venue Rental: ${booking.hall?.name || 'Function Hall'} (${booking.eventType})`,
                    quantity: 1,
                    unitPrice: hallAmt,
                    amount: hallAmt
                  },
                  ...(servAmt > 0
                    ? [
                        {
                          description: 'Selected Add-on Services',
                          quantity: 1,
                          unitPrice: servAmt,
                          amount: servAmt
                        }
                      ]
                    : []),
                  ...(gstAmt > 0
                    ? [
                        {
                          description: 'GST (18%)',
                          quantity: 1,
                          unitPrice: gstAmt,
                          amount: gstAmt
                        }
                      ]
                    : [])
                ]
              }
            }
          });
        }
      }

      // Notifications
      await NotificationService.createNotification(
        'Booking Confirmed',
        `Booking ${updatedBooking.bookingNumber} for ${updatedBooking.hall?.name || 'Hall'} has been successfully confirmed with payment ID ${razorpay_payment_id}.`,
        'success'
      );

      return {
        success: true,
        booking: updatedBooking,
        payment
      };
    });
  }

  /**
   * Retry Razorpay Order for existing pending booking
   */
  async retryRazorpayOrder(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { hall: true, user: true, customer: true }
    });

    if (!booking) {
      throw new Error('NOT_FOUND');
    }

    if (booking.status === BookingStatus.CONFIRMED && booking.paymentStatus === 'PAID') {
      throw new Error('ALREADY_PAID');
    }

    // Re-check hall availability
    if (booking.hallId && booking.eventDate && booking.startTime && booking.endTime) {
      const conflict = await this.bookingRepo.findConflictingBooking(
        prisma,
        booking.hallId,
        booking.eventDate,
        booking.startTime,
        booking.endTime,
        booking.id
      );

      if (conflict) {
        throw new Error('CONFLICT');
      }
    }

    const totalAmount = Number(booking.totalAmount);
    const razorpayOrder = await razorpayService.createOrder(
      totalAmount,
      booking.bookingNumber,
      {
        bookingId: booking.id,
        customerName: booking.customer?.fullName || booking.user?.name,
        customerEmail: booking.customer?.email || booking.user?.email
      }
    );

    await prisma.booking.update({
      where: { id: booking.id },
      data: { razorpayOrderId: razorpayOrder.id }
    });

    return {
      booking,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: razorpayOrder.key_id
      }
    };
  }

  /**
   * Process Razorpay Webhook Event
   */
  async processRazorpayWebhook(bodyString: string, signature: string, eventData: any) {
    const isValid = razorpayService.verifyWebhookSignature(bodyString, signature);
    if (!isValid) {
      throw new Error('INVALID_WEBHOOK_SIGNATURE');
    }

    const event = eventData.event;
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = eventData.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id || eventData.payload?.order?.entity?.id;
      const paymentId = paymentEntity?.id;

      if (orderId && paymentId) {
        const booking = await prisma.booking.findFirst({
          where: { razorpayOrderId: orderId }
        });

        if (booking && booking.status !== BookingStatus.CONFIRMED) {
          await this.verifyRazorpayPayment({
            bookingId: booking.id,
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature // Webhook verified
          });
        }
      }
    }
  }

  /**
   * Create a legacy/basic event booking
   */
  async create(
    userId: string,
    data: {
      hallId: string;
      eventType: string;
      eventDate: string;
      startTime: string;
      endTime: string;
      guestCount: number;
      notes?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      district?: string;
      state?: string;
      country?: string;
      pincode?: string;
    }
  ): Promise<Booking> {
    const { hallId, eventType, eventDate, startTime, endTime, guestCount, notes, addressLine1, addressLine2, city, district, state, country, pincode } = data;

    const normalizedDate = new Date(eventDate);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (normalizedDate < today) throw new Error('PAST_DATE');
    if (startTime >= endTime) throw new Error('INVALID_TIME_RANGE');
    if (!guestCount || guestCount <= 0) throw new Error('INVALID_GUEST_COUNT');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('USER_NOT_FOUND');

    const hall = await prisma.hall.findUnique({ where: { id: hallId } });
    if (!hall) throw new Error('HALL_NOT_FOUND');
    if (hall.status !== 'AVAILABLE') throw new Error('HALL_UNAVAILABLE_STATUS');

    const totalAmount = hall.basePrice;

    return await prisma.$transaction(
      async (tx) => {
        const conflict = await this.bookingRepo.findConflictingBooking(
          tx,
          hallId,
          normalizedDate,
          startTime,
          endTime
        );

        if (conflict) throw new Error('CONFLICT');

        const bookingNumber = this.generateBookingNumber();

      // Create booking inside transaction
      return await this.bookingRepo.createBooking(tx, {
        bookingNumber,
        userId,
        hallId,
        eventType,
        eventDate: normalizedDate,
        startTime,
        endTime,
        guestCount,
        totalAmount,
        status: BookingStatus.PENDING,
        notes: notes || null,
        addressLine1: addressLine1 || null,
        addressLine2: addressLine2 || null,
        city: city || null,
        district: district || null,
        state: state || null,
        country: country || null,
        pincode: pincode || null
      });
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    });
  }

  /**
   * Get booking details by ID
   */
  async getById(id: string, userId: string, role: string): Promise<Booking> {
    const booking = await this.bookingRepo.findById(id);
    if (!booking) throw new Error('NOT_FOUND');

    if (role !== 'Admin' && role !== 'Employee' && booking.userId !== userId) {
      throw new Error('FORBIDDEN');
    }

    return booking;
  }

  /**
   * Get own bookings list for Customer
   */
  async getMyBookings(userId: string): Promise<Booking[]> {
    return await this.bookingRepo.findByUserId(userId);
  }

  /**
   * Get all bookings in the system (Admin / Employee)
   */
  async getAll(): Promise<Booking[]> {
    return await this.bookingRepo.findAll();
  }

  /**
   * Update booking status (Admin / Employee)
   */
  async updateStatus(id: string, status: string): Promise<Booking> {
    const validStatuses = Object.keys(BookingStatus);
    if (!validStatuses.includes(status)) throw new Error('INVALID_STATUS');

    const booking = await this.bookingRepo.findById(id);
    if (!booking) throw new Error('NOT_FOUND');

    return await this.bookingRepo.updateStatus(id, status as BookingStatus);
  }

  /**
   * Cancel booking
   */
  async cancel(id: string, userId: string, role: string): Promise<Booking> {
    const booking = await this.bookingRepo.findById(id);
    if (!booking) throw new Error('NOT_FOUND');

    if (role !== 'Admin' && role !== 'Employee' && booking.userId !== userId) {
      throw new Error('FORBIDDEN');
    }

    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.REJECTED ||
      booking.status === BookingStatus.COMPLETED
    ) {
      throw new Error('ALREADY_FINALIZED');
    }

    return await this.bookingRepo.cancelBooking(id);
  }
}
