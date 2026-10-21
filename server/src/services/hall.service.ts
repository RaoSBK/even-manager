import { HallRepository } from '../repositories/hall.repository';
import prisma from '../config/database';
import { Hall, HallStatus, BookingStatus, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

export class HallService {
  private hallRepo = new HallRepository();

  /**
   * Check hall availability by date and optional time range
   */
  async checkAvailability(
    dateStr: string,
    startTime?: string,
    endTime?: string
  ): Promise<any[]> {
    const queryDate = new Date(dateStr);
    queryDate.setUTCHours(0, 0, 0, 0);

    const halls = await this.hallRepo.findAll();
    const results = [];

    for (const hall of halls) {
      if (hall.status !== 'AVAILABLE') {
        results.push({
          id: hall.id,
          name: hall.name,
          hallCode: hall.hallCode,
          description: hall.description,
          location: hall.location,
          state: (hall as any).state || null,
          district: (hall as any).district || null,
          mandal: (hall as any).mandal || null,
          capacity: hall.capacity,
          basePrice: Number(hall.basePrice),
          status: hall.status,
          available: false
        });
        continue;
      }

      const whereClause: any = {
        hallId: hall.id,
        eventDate: queryDate,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS]
        }
      };

      if (startTime && endTime) {
        whereClause.startTime = { lt: endTime };
        whereClause.endTime = { gt: startTime };
      }

      const conflict = await prisma.booking.findFirst({
        where: whereClause
      });

      results.push({
        id: hall.id,
        name: hall.name,
        hallCode: hall.hallCode,
        description: hall.description,
        location: hall.location,
        state: (hall as any).state || null,
        district: (hall as any).district || null,
        mandal: (hall as any).mandal || null,
        capacity: hall.capacity,
        basePrice: Number(hall.basePrice),
        status: hall.status,
        available: !conflict
      });
    }

    return results;
  }

  /**
   * CRUD
   */
  async getHalls(): Promise<Hall[]> {
    return await this.hallRepo.findAll();
  }

  async getHallById(id: string): Promise<Hall> {
    const hall = await this.hallRepo.findById(id);
    if (!hall) throw new Error('HALL_NOT_FOUND');
    return hall;
  }

  async getMyHall(userId: string): Promise<Hall | null> {
    return await this.hallRepo.findByOwnerId(userId);
  }

  /**
   * Admin: Get all halls including assigned manager profile
   */
  async getAdminOverview(): Promise<any[]> {
    return await this.hallRepo.findAllWithManager();
  }

  /**
   * Admin: Assign, provision, or update manager account for a hall
   */
  async assignManager(
    hallId: string,
    data: {
      userId?: string;
      name?: string;
      loginId?: string;
      email?: string;
      mobile?: string;
      password?: string;
      isActive?: boolean;
    }
  ): Promise<any> {
    const hall = await this.hallRepo.findRawById(hallId);
    if (!hall) {
      throw new Error('HALL_NOT_FOUND');
    }

    // Mode 1: Assign existing user by userId
    if (data.userId) {
      const existingUser = await prisma.user.findUnique({
        where: { id: data.userId }
      });
      if (!existingUser) {
        throw new Error('USER_NOT_FOUND');
      }

      // Check if user is already assigned to another hall
      const assignedOtherHall = await prisma.hall.findFirst({
        where: { ownerId: existingUser.id, id: { not: hallId } }
      });
      if (assignedOtherHall) {
        throw new Error('USER_ALREADY_MANAGES_ANOTHER_HALL');
      }

      // Update user role to Hall_Manager if not Admin
      if (existingUser.role !== 'Admin') {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { role: 'Hall_Manager' }
        });
      }

      // Link user to hall
      await prisma.hall.update({
        where: { id: hallId },
        data: { ownerId: existingUser.id }
      });

      return {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        mobile: existingUser.mobile,
        loginId: existingUser.loginId,
        isActive: existingUser.isActive,
        createdAt: existingUser.createdAt
      };
    }

    // Mode 2: Provision a new manager account OR update existing assigned manager
    const { name, loginId, email, mobile, password, isActive } = data;

    if (!name || !loginId) {
      throw new Error('MISSING_REQUIRED_FIELDS');
    }

    const cleanLoginId = loginId.trim();
    if (cleanLoginId.length < 3) {
      throw new Error('INVALID_LOGIN_ID_LENGTH');
    }

    let currentManager: any = null;
    if (hall.ownerId) {
      currentManager = await prisma.user.findUnique({ where: { id: hall.ownerId } });
    }

    // Check unique loginId
    const existingByLoginId = await prisma.user.findFirst({
      where: { loginId: cleanLoginId }
    });

    if (currentManager) {
      if (existingByLoginId && existingByLoginId.id !== currentManager.id) {
        throw new Error('LOGIN_ID_EXISTS');
      }
    } else if (existingByLoginId) {
      throw new Error('LOGIN_ID_EXISTS');
    }

    // Check email uniqueness if provided
    let finalEmail: string = (email && email.trim()) || '';
    if (finalEmail) {
      const existingByEmail = await prisma.user.findUnique({
        where: { email: finalEmail }
      });
      if (existingByEmail && existingByEmail.id !== hall.ownerId) {
        throw new Error('EMAIL_EXISTS');
      }
    } else if (currentManager && currentManager.email) {
      finalEmail = currentManager.email;
    } else {
      finalEmail = `${cleanLoginId.toLowerCase()}@manager.gkbooking.local`;
    }

    // Check mobile uniqueness if provided
    let finalMobile: string = (mobile && mobile.trim()) || '';
    if (finalMobile) {
      const existingByMobile = await prisma.user.findUnique({
        where: { mobile: finalMobile }
      });
      if (existingByMobile && existingByMobile.id !== hall.ownerId) {
        throw new Error('MOBILE_EXISTS');
      }
    } else if (currentManager && currentManager.mobile) {
      finalMobile = currentManager.mobile;
    } else {
      finalMobile = '98' + Math.floor(10000000 + Math.random() * 90000000).toString();
    }

    // If this hall already has an assigned manager and we are updating that existing manager
    if (currentManager) {
      const updateData: any = {
        name: name.trim(),
        loginId: cleanLoginId,
        email: finalEmail,
        mobile: finalMobile
      };
      if (typeof isActive === 'boolean') {
        updateData.isActive = isActive;
      }
      if (password && password.trim()) {
        if (password.length < 6) throw new Error('PASSWORD_TOO_SHORT');
        updateData.password = await bcrypt.hash(password, 10);
      }

      const updatedUser = await prisma.user.update({
        where: { id: currentManager.id },
        data: updateData
      });

      return {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        loginId: updatedUser.loginId,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt
      };
    }

    // Otherwise, creating a new manager: password is required
    if (!password || !password.trim()) {
      throw new Error('MISSING_REQUIRED_FIELDS');
    }
    if (password.length < 6) {
      throw new Error('PASSWORD_TOO_SHORT');
    }
    if (existingByLoginId) {
      throw new Error('LOGIN_ID_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'u-mgr-' + Math.random().toString(36).substr(2, 8);

    const newUser = await prisma.user.create({
      data: {
        id: userId,
        name: name.trim(),
        loginId: cleanLoginId,
        email: finalEmail,
        mobile: finalMobile,
        password: hashedPassword,
        role: 'Hall_Manager',
        isActive: typeof isActive === 'boolean' ? isActive : true
      }
    });

    // Link user to hall
    await prisma.hall.update({
      where: { id: hallId },
      data: { ownerId: newUser.id }
    });

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      mobile: newUser.mobile,
      loginId: newUser.loginId,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt
    };
  }

  /**
   * Admin: Reset password for the hall's assigned manager
   */
  async resetManagerPassword(hallId: string, newPassword: string): Promise<void> {
    const hall = await this.hallRepo.findRawById(hallId);
    if (!hall) {
      throw new Error('HALL_NOT_FOUND');
    }
    if (!hall.ownerId) {
      throw new Error('NO_MANAGER_ASSIGNED');
    }
    if (!newPassword || newPassword.length < 6) {
      throw new Error('PASSWORD_TOO_SHORT');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: hall.ownerId },
      data: { password: hashedPassword }
    });
  }

  /**
   * Admin: Toggle active/inactive status for the hall's assigned manager
   */
  async toggleManagerActive(hallId: string, isActive: boolean): Promise<boolean> {
    const hall = await this.hallRepo.findRawById(hallId);
    if (!hall) {
      throw new Error('HALL_NOT_FOUND');
    }
    if (!hall.ownerId) {
      throw new Error('NO_MANAGER_ASSIGNED');
    }

    const updated = await prisma.user.update({
      where: { id: hall.ownerId },
      data: { isActive: Boolean(isActive) }
    });

    return updated.isActive;
  }

  /**
   * Admin: Revoke manager assignment from a hall
   */
  async revokeManager(hallId: string): Promise<void> {
    const hall = await this.hallRepo.findRawById(hallId);
    if (!hall) {
      throw new Error('HALL_NOT_FOUND');
    }

    await prisma.hall.update({
      where: { id: hallId },
      data: { ownerId: null }
    });
  }

  async createHall(data: {
    name: string;
    description?: string;
    location?: string;
    state?: string;
    district?: string;
    mandal?: string;
    capacity: number;
    basePrice: number;
    status?: HallStatus;
    manager?: {
      name: string;
      loginId: string;
      email?: string;
      mobile?: string;
      password: string;
      isActive?: boolean;
    };
  }): Promise<Hall> {
    const hallCode = 'HALL-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    const hall = await this.hallRepo.create({
      hallCode,
      name: data.name,
      description: data.description || null,
      location: data.location || null,
      state: data.state || null,
      district: data.district || null,
      mandal: data.mandal || null,
      capacity: Number(data.capacity),
      basePrice: Number(data.basePrice),
      status: data.status || HallStatus.AVAILABLE
    } as any);

    if (data.manager && data.manager.loginId && (data.manager.password || (data.manager as any).userId)) {
      try {
        await this.assignManager(hall.id, data.manager);
      } catch (mgrErr) {
        console.error('Initial manager assignment warning:', mgrErr);
      }
    }

    return hall;
  }

  async updateHall(id: string, data: any): Promise<Hall> {
    const hall = await this.hallRepo.findById(id);
    if (!hall) throw new Error('HALL_NOT_FOUND');

    const updateData: any = {
      name: data.name,
      description: data.description,
      location: data.location,
      state: data.state !== undefined ? data.state : undefined,
      district: data.district !== undefined ? data.district : undefined,
      mandal: data.mandal !== undefined ? data.mandal : undefined,
      capacity: data.capacity ? Number(data.capacity) : undefined,
      basePrice: data.basePrice ? Number(data.basePrice) : undefined,
      status: data.status
    };

    const updated = await this.hallRepo.update(id, updateData);

    // If manager payload is included in update
    if (data.manager) {
      if (data.manager.revoke) {
        await this.revokeManager(id);
      } else if (data.manager.loginId || data.manager.name || data.manager.userId) {
        await this.assignManager(id, data.manager);
      }
    }

    return updated;
  }

  async deleteHall(id: string): Promise<Hall> {
    const hall = await this.hallRepo.findById(id);
    if (!hall) throw new Error('HALL_NOT_FOUND');
    return await this.hallRepo.delete(id);
  }

  /**
   * Monthly calendar bookings for a specific hall
   */
  async getHallBookings(hallId: string, start: string, end: string, userId?: string, role?: string): Promise<any[]> {
    const isManager = role && (
      role.toUpperCase() === 'OWNER' ||
      role.toUpperCase() === 'HALL_MANAGER' ||
      role.toUpperCase() === 'MANAGER'
    );
    if (isManager) {
      const myHall = await this.hallRepo.findByOwnerId(userId || '');
      if (!myHall || myHall.id !== hallId) {
        throw new Error('FORBIDDEN');
      }
    }
    const startDate = new Date(start);
    const endDate = new Date(end);

    const bookings = await prisma.booking.findMany({
      where: {
        hallId,
        eventDate: {
          gte: startDate,
          lte: endDate
        },
        status: {
          not: BookingStatus.CANCELLED
        }
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });

    return bookings.map(b => {
      const isBlocked = Boolean(
        b.bookingNumber?.startsWith('BLK-') ||
        b.eventType?.toLowerCase().includes('maintenance') ||
        b.eventType?.toLowerCase().includes('blocked')
      );
      return {
        id: b.id,
        title: b.eventType || (isBlocked ? 'Blocked / Maintenance' : 'Event Booking'),
        start: b.eventDate,
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status, // PENDING, CONFIRMED, COMPLETED
        clientName: isBlocked ? 'Manager Block' : (b.user?.name || 'Client'),
        notes: b.notes,
        eventType: b.eventType,
        isBlocked
      };
    });
  }

  /**
   * Manager/Admin: Update hall operating status (AVAILABLE, MAINTENANCE, INACTIVE)
   */
  async updateMyHallStatus(userId: string, role: string, status: HallStatus, hallId?: string): Promise<Hall> {
    const isManager = role && (
      role.toUpperCase() === 'OWNER' ||
      role.toUpperCase() === 'HALL_MANAGER' ||
      role.toUpperCase() === 'MANAGER'
    );

    let hall: Hall | null = null;
    if (isManager) {
      hall = await this.hallRepo.findByOwnerId(userId);
      if (!hall) throw new Error('HALL_NOT_FOUND');
    } else {
      if (!hallId) {
        hall = await this.hallRepo.findByOwnerId(userId);
        if (!hall) {
          const allHalls = await this.hallRepo.findAll();
          hall = allHalls[0] || null;
        }
      } else {
        hall = await this.hallRepo.findById(hallId);
      }
      if (!hall) throw new Error('HALL_NOT_FOUND');
    }

    if (!['AVAILABLE', 'MAINTENANCE', 'INACTIVE'].includes(status)) {
      throw new Error('INVALID_STATUS');
    }

    return await this.hallRepo.update(hall.id, { status });
  }

  /**
   * Manager/Admin: Toggle or set availability for a specific date (block / unblock)
   */
  async toggleDateAvailability(
    userId: string,
    role: string,
    data: {
      date: string;
      reason?: string;
      available?: boolean;
      bookingId?: string;
      hallId?: string;
    }
  ): Promise<{ message: string; available: boolean; date: string; block?: any }> {
    const isManager = role && (
      role.toUpperCase() === 'OWNER' ||
      role.toUpperCase() === 'HALL_MANAGER' ||
      role.toUpperCase() === 'MANAGER'
    );

    let hall: Hall | null = null;
    if (isManager) {
      hall = await this.hallRepo.findByOwnerId(userId);
      if (!hall) throw new Error('HALL_NOT_FOUND');
    } else {
      if (data.hallId) {
        hall = await this.hallRepo.findById(data.hallId);
      } else {
        hall = await this.hallRepo.findByOwnerId(userId);
        if (!hall) {
          const all = await this.hallRepo.findAll();
          hall = all[0] || null;
        }
      }
      if (!hall) throw new Error('HALL_NOT_FOUND');
    }

    // If bookingId is provided, directly remove the block
    if (data.bookingId) {
      const existingBlock = await prisma.booking.findFirst({
        where: { id: data.bookingId, hallId: hall.id }
      });
      if (!existingBlock) {
        throw new Error('BLOCK_NOT_FOUND');
      }
      const isBlockedRecord = existingBlock.bookingNumber.startsWith('BLK-') ||
        existingBlock.eventType?.toLowerCase().includes('maintenance') ||
        existingBlock.eventType?.toLowerCase().includes('blocked');

      if (!isBlockedRecord) {
        throw new Error('CANNOT_UNBLOCK_CUSTOMER_BOOKING');
      }

      await prisma.booking.delete({
        where: { id: existingBlock.id }
      });

      return {
        message: 'Date unblocked and marked as Available.',
        available: true,
        date: existingBlock.eventDate ? existingBlock.eventDate.toISOString().split('T')[0] : data.date
      };
    }

    if (!data.date) {
      throw new Error('DATE_REQUIRED');
    }

    const targetDate = new Date(data.date);
    targetDate.setUTCHours(0, 0, 0, 0);

    // Look for active bookings on that date
    const existing = await prisma.booking.findFirst({
      where: {
        hallId: hall.id,
        eventDate: targetDate,
        status: { not: BookingStatus.CANCELLED }
      }
    });

    if (existing) {
      const isBlockedRecord = existing.bookingNumber.startsWith('BLK-') ||
        existing.eventType?.toLowerCase().includes('maintenance') ||
        existing.eventType?.toLowerCase().includes('blocked');

      if (!isBlockedRecord) {
        throw new Error('ACTIVE_CUSTOMER_BOOKING_EXISTS');
      }

      // If already blocked:
      if (data.available === true || data.available === undefined) {
        // Toggle or set to Available -> remove block
        await prisma.booking.delete({
          where: { id: existing.id }
        });
        return {
          message: 'Date marked as Available.',
          available: true,
          date: data.date
        };
      } else {
        // Update block reason
        if (data.reason) {
          const updated = await prisma.booking.update({
            where: { id: existing.id },
            data: {
              eventType: `Blocked: ${data.reason.trim()}`,
              notes: data.reason.trim()
            }
          });
          return {
            message: 'Block details updated.',
            available: false,
            date: data.date,
            block: updated
          };
        }
        return {
          message: 'Date is already blocked.',
          available: false,
          date: data.date,
          block: existing
        };
      }
    } else {
      // Date is currently Available (default).
      if (data.available === true) {
        return {
          message: 'Date is already Available.',
          available: true,
          date: data.date
        };
      }

      // Mark as Blocked / Unavailable
      const bookingNumber = `BLK-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      const blockReason = data.reason && data.reason.trim() ? data.reason.trim() : 'Hall Maintenance';

      const newBlock = await prisma.booking.create({
        data: {
          bookingNumber,
          hallId: hall.id,
          userId,
          eventType: `Blocked: ${blockReason}`,
          eventDate: targetDate,
          startTime: '00:00',
          endTime: '23:59',
          status: BookingStatus.CONFIRMED,
          totalAmount: 0,
          notes: blockReason
        }
      });

      return {
        message: 'Date marked as Unavailable / Blocked.',
        available: false,
        date: data.date,
        block: newBlock
      };
    }
  }
}
