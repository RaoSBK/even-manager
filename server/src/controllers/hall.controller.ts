import { Request, Response } from 'express';
import { HallService } from '../services/hall.service';
import { HallStatus } from '@prisma/client';

export class HallController {
  private hallService = new HallService();

  /**
   * Check hall availability for a given date and optional times
   */
  async getAvailability(req: Request, res: Response) {
    try {
      const { date, startTime, endTime } = req.query;

      if (!date || typeof date !== 'string') {
        return res.status(400).json({ message: 'Query parameter "date" in YYYY-MM-DD format is required.' });
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
      }

      if (startTime && endTime && typeof startTime === 'string' && typeof endTime === 'string') {
        if (startTime >= endTime) {
          return res.status(400).json({ message: 'End time must be after start time.' });
        }
      }

      const hallsAvailability = await this.hallService.checkAvailability(
        date,
        typeof startTime === 'string' ? startTime : undefined,
        typeof endTime === 'string' ? endTime : undefined
      );

      return res.status(200).json({
        date,
        halls: hallsAvailability
      });
    } catch (error: any) {
      console.error('Get availability controller error:', error);
      return res.status(500).json({ message: 'Internal server error while checking availability.' });
    }
  }

  /**
   * CRUD
   */
  async getHalls(req: Request, res: Response) {
    try {
      const halls = await this.hallService.getHalls();
      return res.status(200).json(halls);
    } catch (error: any) {
      console.error('Get halls error:', error);
      return res.status(500).json({ message: 'Internal server error while fetching halls.' });
    }
  }

  async getHallById(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const hall = await this.hallService.getHallById(id);
      return res.status(200).json(hall);
    } catch (error: any) {
      if (error.message === 'HALL_NOT_FOUND') {
        return res.status(404).json({ message: 'Hall not found.' });
      }
      console.error('Get hall by id error:', error);
      return res.status(500).json({ message: 'Internal server error while fetching hall details.' });
    }
  }

  async getMyHall(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const hall = await this.hallService.getMyHall(userId);
      if (!hall) {
        return res.status(404).json({ message: 'No hall is currently assigned to this owner account.' });
      }
      return res.status(200).json(hall);
    } catch (error: any) {
      console.error('Get my hall error:', error);
      return res.status(500).json({ message: 'Internal server error while fetching assigned hall details.' });
    }
  }

  /**
   * Admin: Get all halls with assigned manager
   */
  async getAdminOverview(req: Request, res: Response) {
    try {
      const halls = await this.hallService.getAdminOverview();
      return res.status(200).json(halls);
    } catch (error: any) {
      console.error('Get admin overview error:', error);
      return res.status(500).json({ message: 'Internal server error while fetching halls overview.' });
    }
  }

  /**
   * Admin: Assign or create manager for hall
   */
  async assignManager(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const { userId, name, loginId, email, mobile, password, isActive } = req.body;

      if (!userId && (!name || !loginId)) {
        return res.status(400).json({ message: 'Please provide either an existing userId or manager credentials (name, loginId).' });
      }

      const manager = await this.hallService.assignManager(id, {
        userId,
        name,
        loginId,
        email,
        mobile,
        password,
        isActive
      });

      return res.status(200).json({
        message: 'Hall manager assigned successfully.',
        manager
      });
    } catch (error: any) {
      if (error.message === 'HALL_NOT_FOUND') {
        return res.status(404).json({ message: 'Function hall not found.' });
      }
      if (error.message === 'USER_NOT_FOUND') {
        return res.status(404).json({ message: 'Selected user was not found.' });
      }
      if (error.message === 'USER_ALREADY_MANAGES_ANOTHER_HALL') {
        return res.status(400).json({ message: 'This user is already assigned as manager to another hall.' });
      }
      if (error.message === 'LOGIN_ID_EXISTS') {
        return res.status(400).json({ message: 'This Login ID is already in use by another account. Please choose a different one.' });
      }
      if (error.message === 'EMAIL_EXISTS') {
        return res.status(400).json({ message: 'This email address is already in use.' });
      }
      if (error.message === 'MOBILE_EXISTS') {
        return res.status(400).json({ message: 'This mobile number is already registered.' });
      }
      if (error.message === 'PASSWORD_TOO_SHORT') {
        return res.status(400).json({ message: 'Password must be at least 6 characters.' });
      }
      if (error.message === 'INVALID_LOGIN_ID_LENGTH') {
        return res.status(400).json({ message: 'Login ID must be at least 3 characters.' });
      }

      console.error('Assign manager error:', error);
      return res.status(500).json({ message: 'Internal server error while assigning manager.' });
    }
  }

  /**
   * Admin: Reset manager password
   */
  async resetManagerPassword(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'New password is required and must be at least 6 characters.' });
      }

      await this.hallService.resetManagerPassword(id, newPassword);
      return res.status(200).json({ message: 'Manager password has been reset successfully.' });
    } catch (error: any) {
      if (error.message === 'HALL_NOT_FOUND') {
        return res.status(404).json({ message: 'Function hall not found.' });
      }
      if (error.message === 'NO_MANAGER_ASSIGNED') {
        return res.status(400).json({ message: 'No manager is currently assigned to this function hall.' });
      }
      if (error.message === 'PASSWORD_TOO_SHORT') {
        return res.status(400).json({ message: 'Password must be at least 6 characters.' });
      }

      console.error('Reset manager password error:', error);
      return res.status(500).json({ message: 'Internal server error while resetting password.' });
    }
  }

  /**
   * Admin: Toggle manager active status
   */
  async toggleManagerActive(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: 'isActive boolean flag is required.' });
      }

      const updatedStatus = await this.hallService.toggleManagerActive(id, isActive);
      return res.status(200).json({
        message: `Manager account ${updatedStatus ? 'activated' : 'deactivated'} successfully.`,
        isActive: updatedStatus
      });
    } catch (error: any) {
      if (error.message === 'HALL_NOT_FOUND') {
        return res.status(404).json({ message: 'Function hall not found.' });
      }
      if (error.message === 'NO_MANAGER_ASSIGNED') {
        return res.status(400).json({ message: 'No manager is currently assigned to this function hall.' });
      }

      console.error('Toggle manager active error:', error);
      return res.status(500).json({ message: 'Internal server error while toggling manager status.' });
    }
  }

  /**
   * Admin: Revoke manager assignment
   */
  async revokeManager(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      await this.hallService.revokeManager(id);
      return res.status(200).json({ message: 'Manager assignment revoked successfully.' });
    } catch (error: any) {
      if (error.message === 'HALL_NOT_FOUND') {
        return res.status(404).json({ message: 'Function hall not found.' });
      }
      console.error('Revoke manager error:', error);
      return res.status(500).json({ message: 'Internal server error while revoking manager.' });
    }
  }

  async createHall(req: Request, res: Response) {
    try {
      const { name, description, location, state, district, mandal, capacity, basePrice, status, manager } = req.body;

      if (!name || capacity === undefined || basePrice === undefined) {
        return res.status(400).json({ message: 'Name, capacity, and base price are required.' });
      }

      const hall = await this.hallService.createHall({
        name,
        description,
        location,
        state,
        district,
        mandal,
        capacity,
        basePrice,
        status: status as HallStatus,
        manager
      });

      return res.status(201).json({
        message: 'Hall created successfully.',
        hall
      });
    } catch (error: any) {
      console.error('Create hall error:', error);
      return res.status(500).json({ message: 'Internal server error while creating hall.' });
    }
  }

  async updateHall(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const hall = await this.hallService.updateHall(id, req.body);
      return res.status(200).json({
        message: 'Hall updated successfully.',
        hall
      });
    } catch (error: any) {
      if (error.message === 'HALL_NOT_FOUND') {
        return res.status(404).json({ message: 'Hall not found.' });
      }
      if (error.message === 'LOGIN_ID_EXISTS') {
        return res.status(400).json({ message: 'This Login ID is already in use by another manager.' });
      }
      if (error.message === 'PASSWORD_TOO_SHORT') {
        return res.status(400).json({ message: 'Manager password must be at least 6 characters.' });
      }
      if (error.message === 'EMAIL_EXISTS') {
        return res.status(400).json({ message: 'This email is already in use.' });
      }
      if (error.message === 'MOBILE_EXISTS') {
        return res.status(400).json({ message: 'This mobile number is already registered.' });
      }
      console.error('Update hall error:', error);
      return res.status(500).json({ message: 'Internal server error while updating hall.' });
    }
  }

  async deleteHall(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      await this.hallService.deleteHall(id);
      return res.status(200).json({ message: 'Hall deleted/deactivated successfully.' });
    } catch (error: any) {
      if (error.message === 'HALL_NOT_FOUND') {
        return res.status(404).json({ message: 'Hall not found.' });
      }
      console.error('Delete hall error:', error);
      return res.status(500).json({ message: 'Internal server error while deleting hall.' });
    }
  }

  async getHallBookings(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const { start, end } = req.query;

      if (!start || !end) {
        return res.status(400).json({ message: 'Start and end date range is required.' });
      }

      const userId = req.user?.id;
      const role = req.user?.role;
      const bookings = await this.hallService.getHallBookings(id, String(start), String(end), userId, role);
      return res.status(200).json(bookings);
    } catch (error: any) {
      if (error.message === 'FORBIDDEN') {
        return res.status(403).json({ message: 'Forbidden: You do not have permission to view calendar bookings for this hall.' });
      }
      console.error('Get hall bookings calendar error:', error);
      return res.status(500).json({ message: 'Internal server error while fetching hall calendar bookings.' });
    }
  }

  /**
   * Manager: Update own hall status (AVAILABLE, MAINTENANCE, INACTIVE)
   */
  async updateMyHallStatus(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Authentication required.' });
      }

      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: 'Status is required.' });
      }

      const updatedHall = await this.hallService.updateMyHallStatus(
        user.id,
        user.role,
        status,
        req.body.hallId
      );

      return res.status(200).json({
        message: `Hall operating status updated to ${status}.`,
        status: updatedHall.status,
        hall: updatedHall
      });
    } catch (error: any) {
      if (error.message === 'HALL_NOT_FOUND') {
        return res.status(404).json({ message: 'No hall found assigned to this manager.' });
      }
      if (error.message === 'INVALID_STATUS') {
        return res.status(400).json({ message: 'Invalid status. Supported: AVAILABLE, MAINTENANCE, INACTIVE.' });
      }
      console.error('Update hall status error:', error);
      return res.status(500).json({ message: 'Internal server error while updating hall status.' });
    }
  }

  /**
   * Manager: Toggle or change date availability (block/unblock date)
   */
  async toggleDateAvailability(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Authentication required.' });
      }

      const result = await this.hallService.toggleDateAvailability(
        user.id,
        user.role,
        req.body
      );

      return res.status(200).json(result);
    } catch (error: any) {
      if (error.message === 'HALL_NOT_FOUND') {
        return res.status(404).json({ message: 'No hall found assigned to this manager.' });
      }
      if (error.message === 'ACTIVE_CUSTOMER_BOOKING_EXISTS') {
        return res.status(400).json({ message: 'Cannot block this date because an active customer booking already exists.' });
      }
      if (error.message === 'CANNOT_UNBLOCK_CUSTOMER_BOOKING') {
        return res.status(400).json({ message: 'Cannot unblock a customer booking. Use booking cancellation instead.' });
      }
      if (error.message === 'BLOCK_NOT_FOUND') {
        return res.status(404).json({ message: 'Block record not found.' });
      }
      if (error.message === 'DATE_REQUIRED') {
        return res.status(400).json({ message: 'Date is required.' });
      }
      console.error('Toggle date availability error:', error);
      return res.status(500).json({ message: 'Internal server error while changing date availability.' });
    }
  }
}
