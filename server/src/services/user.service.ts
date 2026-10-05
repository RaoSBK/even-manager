import { UserRepository } from '../repositories/user.repository';
import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import { Customer, Employee, User, EmployeeStatus } from '@prisma/client';

export class UserService {
  private userRepo = new UserRepository();

  /**
   * Customers
   */
  async getCustomers(search?: string): Promise<any[]> {
    return await this.userRepo.findCustomers(search);
  }

  async getCustomerById(id: string): Promise<any> {
    const customer = await this.userRepo.findCustomerById(id);
    if (!customer) throw new Error('CUSTOMER_NOT_FOUND');
    return customer;
  }

  async createCustomer(data: {
    fullName: string;
    email: string;
    phone: string;
    alternatePhone?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    notes?: string;
    password?: string;
  }): Promise<Customer> {
    const defaultPassword = data.password || 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const userId = 'u-' + Math.random().toString(36).substr(2, 9);
    const customerId = 'cst-' + Math.random().toString(36).substr(2, 9);

    // Double check email and phone uniqueness in User
    const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingEmail) throw new Error('EMAIL_ALREADY_EXISTS');

    const existingMobile = await prisma.user.findUnique({ where: { mobile: data.phone } });
    if (existingMobile) throw new Error('MOBILE_ALREADY_EXISTS');

    return await prisma.$transaction(async (tx) => {
      // 1. Create User record
      await this.userRepo.createUser(tx, {
        id: userId,
        name: data.fullName,
        email: data.email,
        mobile: data.phone,
        password: hashedPassword,
        role: 'Customer',
        isActive: true,
        isVerified: true
      });

      // 2. Create Customer record
      return await this.userRepo.createCustomer(tx, {
        id: customerId,
        userId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        alternatePhone: data.alternatePhone || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        postalCode: data.postalCode || null,
        notes: data.notes || null
      });
    });
  }

  async updateCustomer(id: string, data: any): Promise<Customer> {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new Error('CUSTOMER_NOT_FOUND');

    const updateData: any = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      alternatePhone: data.alternatePhone,
      address: data.address,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      notes: data.notes
    };

    const updated = await this.userRepo.updateCustomer(id, updateData);

    // Update associated User too if exist
    if (customer.userId) {
      await this.userRepo.updateUser(customer.userId, {
        name: data.fullName,
        email: data.email,
        mobile: data.phone
      });
    }

    return updated;
  }

  async toggleCustomerActive(id: string): Promise<boolean> {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer || !customer.userId) throw new Error('CUSTOMER_NOT_FOUND');

    const user = await prisma.user.findUnique({ where: { id: customer.userId } });
    if (!user) throw new Error('USER_NOT_FOUND');

    const newStatus = !user.isActive;
    await this.userRepo.updateUser(customer.userId, { isActive: newStatus });
    return newStatus;
  }

  /**
   * Employees
   */
  async getEmployees(search?: string): Promise<any[]> {
    return await this.userRepo.findEmployees(search);
  }

  async getEmployeeById(id: string): Promise<any> {
    const employee = await this.userRepo.findEmployeeById(id);
    if (!employee) throw new Error('EMPLOYEE_NOT_FOUND');
    return employee;
  }

  async createEmployee(data: {
    name: string;
    email: string;
    phone: string;
    department?: string;
    designation?: string;
    joiningDate?: string;
    salary?: number;
    emergencyContact?: string;
    address?: string;
    status?: EmployeeStatus;
    password?: string;
  }): Promise<Employee> {
    const defaultPassword = data.password || 'employee123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const userId = 'u-' + Math.random().toString(36).substr(2, 9);
    const employeeId = 'emp-' + Math.random().toString(36).substr(2, 9);
    const employeeCode = 'EMP' + Math.floor(100 + Math.random() * 900);

    // Check duplicates
    const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingEmail) throw new Error('EMAIL_ALREADY_EXISTS');

    const existingMobile = await prisma.user.findUnique({ where: { mobile: data.phone } });
    if (existingMobile) throw new Error('MOBILE_ALREADY_EXISTS');

    return await prisma.$transaction(async (tx) => {
      // 1. Create User record with role "Employee"
      await this.userRepo.createUser(tx, {
        id: userId,
        name: data.name,
        email: data.email,
        mobile: data.phone,
        password: hashedPassword,
        role: data.designation === 'Admin' ? 'Admin' : 'Employee',
        isActive: true,
        isVerified: true
      });

      // 2. Create Employee record
      return await this.userRepo.createEmployee(tx, {
        id: employeeId,
        userId,
        employeeCode,
        department: data.department || null,
        designation: data.designation || null,
        joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
        salary: data.salary || null,
        status: data.status || EmployeeStatus.ACTIVE,
        emergencyContact: data.emergencyContact || null,
        address: data.address || null
      });
    });
  }

  async updateEmployee(id: string, data: any): Promise<Employee> {
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) throw new Error('EMPLOYEE_NOT_FOUND');

    const updateData: any = {
      department: data.department,
      designation: data.designation,
      joiningDate: data.joiningDate ? new Date(data.joiningDate) : undefined,
      salary: data.salary,
      emergencyContact: data.emergencyContact,
      address: data.address,
      status: data.status
    };

    const updated = await this.userRepo.updateEmployee(id, updateData);

    if (employee.userId) {
      await this.userRepo.updateUser(employee.userId, {
        name: data.name,
        email: data.email,
        mobile: data.phone,
        role: data.designation === 'Admin' ? 'Admin' : 'Employee'
      });
    }

    return updated;
  }

  async toggleEmployeeActive(id: string): Promise<boolean> {
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee || !employee.userId) throw new Error('EMPLOYEE_NOT_FOUND');

    const user = await prisma.user.findUnique({ where: { id: employee.userId } });
    if (!user) throw new Error('USER_NOT_FOUND');

    const newStatus = !user.isActive;
    await this.userRepo.updateUser(employee.userId, { isActive: newStatus });
    
    // Also toggle EmployeeStatus model field to INACTIVE or ACTIVE
    await this.userRepo.updateEmployee(id, {
      status: newStatus ? EmployeeStatus.ACTIVE : EmployeeStatus.INACTIVE
    });

    return newStatus;
  }

  async changeEmployeePassword(id: string, data: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<{ message: string }> {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!employee || !employee.userId || !employee.user) {
      throw new Error('EMPLOYEE_NOT_FOUND');
    }

    const { currentPassword, newPassword, confirmPassword } = data;

    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new Error('ALL_PASSWORD_FIELDS_REQUIRED');
    }

    if (!newPassword.trim()) {
      throw new Error('NEW_PASSWORD_REQUIRED');
    }

    if (newPassword !== confirmPassword) {
      throw new Error('PASSWORDS_DO_NOT_MATCH');
    }

    if (newPassword === currentPassword) {
      throw new Error('NEW_PASSWORD_MUST_BE_DIFFERENT');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, employee.user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('CURRENT_PASSWORD_INCORRECT');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: employee.userId },
      data: { password: hashedPassword }
    });

    return { message: 'Password changed successfully.' };
  }
}
