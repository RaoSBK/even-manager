import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
  private userService = new UserService();

  /**
   * Customers
   */
  async getCustomers(req: Request, res: Response) {
    try {
      const { search } = req.query;
      const customers = await this.userService.getCustomers(search ? String(search) : undefined);
      return res.status(200).json(customers);
    } catch (error: any) {
      console.error('Get customers controller error:', error);
      return res.status(500).json({ message: 'Internal server error while fetching customers' });
    }
  }

  async getCustomerById(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const customer = await this.userService.getCustomerById(id);
      return res.status(200).json(customer);
    } catch (error: any) {
      if (error.message === 'CUSTOMER_NOT_FOUND') {
        return res.status(404).json({ message: 'Customer profile not found' });
      }
      console.error('Get customer by id controller error:', error);
      return res.status(500).json({ message: 'Internal server error while fetching customer profile' });
    }
  }

  async createCustomer(req: Request, res: Response) {
    try {
      const { fullName, email, phone, alternatePhone, address, city, state, postalCode, notes, password } = req.body;

      if (!fullName || !email || !phone) {
        return res.status(400).json({ message: 'Full name, email, and phone number are required' });
      }

      const customer = await this.userService.createCustomer({
        fullName,
        email,
        phone,
        alternatePhone,
        address,
        city,
        state,
        postalCode,
        notes,
        password
      });

      return res.status(201).json({
        message: 'Customer registered successfully',
        customer
      });
    } catch (error: any) {
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        return res.status(400).json({ message: 'Email address is already in use' });
      }
      if (error.message === 'MOBILE_ALREADY_EXISTS') {
        return res.status(400).json({ message: 'Phone number is already in use' });
      }
      console.error('Create customer controller error:', error);
      return res.status(500).json({ message: 'Internal server error while creating customer' });
    }
  }

  async updateCustomer(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const customer = await this.userService.updateCustomer(id, req.body);
      return res.status(200).json({
        message: 'Customer profile updated successfully',
        customer
      });
    } catch (error: any) {
      if (error.message === 'CUSTOMER_NOT_FOUND') {
        return res.status(404).json({ message: 'Customer profile not found' });
      }
      console.error('Update customer controller error:', error);
      return res.status(500).json({ message: 'Internal server error while updating customer profile' });
    }
  }

  async toggleCustomerActive(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const isActive = await this.userService.toggleCustomerActive(id);
      return res.status(200).json({
        message: `Customer account ${isActive ? 'activated' : 'deactivated'} successfully`,
        isActive
      });
    } catch (error: any) {
      if (error.message === 'CUSTOMER_NOT_FOUND') {
        return res.status(404).json({ message: 'Customer profile not found' });
      }
      console.error('Toggle customer status error:', error);
      return res.status(500).json({ message: 'Internal server error while toggling customer status' });
    }
  }

  /**
   * Employees
   */
  async getEmployees(req: Request, res: Response) {
    try {
      const { search } = req.query;
      const employees = await this.userService.getEmployees(search ? String(search) : undefined);
      return res.status(200).json(employees);
    } catch (error: any) {
      console.error('Get employees controller error:', error);
      return res.status(500).json({ message: 'Internal server error while fetching employees' });
    }
  }

  async getEmployeeById(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const employee = await this.userService.getEmployeeById(id);
      return res.status(200).json(employee);
    } catch (error: any) {
      if (error.message === 'EMPLOYEE_NOT_FOUND') {
        return res.status(404).json({ message: 'Employee profile not found' });
      }
      console.error('Get employee by id controller error:', error);
      return res.status(500).json({ message: 'Internal server error while fetching employee details' });
    }
  }

  async createEmployee(req: Request, res: Response) {
    try {
      const { name, email, phone, department, designation, joiningDate, salary, emergencyContact, address, status, password } = req.body;

      if (!name || !email || !phone) {
        return res.status(400).json({ message: 'Name, email, and phone number are required' });
      }

      const employee = await this.userService.createEmployee({
        name,
        email,
        phone,
        department,
        designation,
        joiningDate,
        salary: salary ? Number(salary) : undefined,
        emergencyContact,
        address,
        status,
        password
      });

      return res.status(201).json({
        message: 'Employee registered successfully',
        employee
      });
    } catch (error: any) {
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        return res.status(400).json({ message: 'Email address is already in use' });
      }
      if (error.message === 'MOBILE_ALREADY_EXISTS') {
        return res.status(400).json({ message: 'Phone number is already in use' });
      }
      console.error('Create employee controller error:', error);
      return res.status(500).json({ message: 'Internal server error while registering employee' });
    }
  }

  async updateEmployee(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const employee = await this.userService.updateEmployee(id, req.body);
      return res.status(200).json({
        message: 'Employee details updated successfully',
        employee
      });
    } catch (error: any) {
      if (error.message === 'EMPLOYEE_NOT_FOUND') {
        return res.status(404).json({ message: 'Employee profile not found' });
      }
      console.error('Update employee controller error:', error);
      return res.status(500).json({ message: 'Internal server error while updating employee details' });
    }
  }

  async toggleEmployeeActive(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const isActive = await this.userService.toggleEmployeeActive(id);
      return res.status(200).json({
        message: `Employee account ${isActive ? 'activated' : 'deactivated'} successfully`,
        isActive
      });
    } catch (error: any) {
      if (error.message === 'EMPLOYEE_NOT_FOUND') {
        return res.status(404).json({ message: 'Employee profile not found' });
      }
      console.error('Toggle employee status error:', error);
      return res.status(500).json({ message: 'Internal server error while toggling employee status' });
    }
  }

  async changeEmployeePassword(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const { currentPassword, newPassword, confirmPassword } = req.body;

      const result = await this.userService.changeEmployeePassword(id, {
        currentPassword,
        newPassword,
        confirmPassword
      });

      return res.status(200).json({ message: result.message });
    } catch (error: any) {
      if (error.message === 'EMPLOYEE_NOT_FOUND') {
        return res.status(404).json({ message: 'Employee profile not found' });
      }
      if (error.message === 'CURRENT_PASSWORD_INCORRECT') {
        return res.status(401).json({ message: 'Current password is incorrect.' });
      }
      if (error.message === 'PASSWORDS_DO_NOT_MATCH') {
        return res.status(400).json({ message: 'New password and confirm password do not match.' });
      }
      if (error.message === 'NEW_PASSWORD_REQUIRED') {
        return res.status(400).json({ message: 'New password cannot be empty.' });
      }
      if (error.message === 'NEW_PASSWORD_MUST_BE_DIFFERENT') {
        return res.status(400).json({ message: 'New password must be different from the current password.' });
      }
      if (error.message === 'ALL_PASSWORD_FIELDS_REQUIRED') {
        return res.status(400).json({ message: 'Current password, new password, and confirm password are required.' });
      }
      console.error('Change employee password error:', error);
      return res.status(500).json({ message: 'Internal server error while updating employee password' });
    }
  }
}
