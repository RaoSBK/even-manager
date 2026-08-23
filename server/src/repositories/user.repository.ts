import { PrismaClient, Customer, Employee, User, Prisma, EmployeeStatus } from '@prisma/client';
import prisma from '../config/database';

export class UserRepository {
  /**
   * Customers Queries
   */
  async findCustomers(search?: string): Promise<any[]> {
    const whereClause: Prisma.CustomerWhereInput = {
      deletedAt: null,
    };

    if (search) {
      whereClause.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    return await prisma.customer.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            isActive: true,
            createdAt: true,
          },
        },
        bookings: {
          select: {
            id: true,
            totalAmount: true,
          },
        },
        events: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findCustomerById(id: string): Promise<any | null> {
    return await prisma.customer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
        bookings: {
          include: {
            hall: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        events: {
          orderBy: {
            eventDate: 'desc',
          },
        },
        payments: {
          orderBy: {
            paymentDate: 'desc',
          },
        },
        invoices: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  async createCustomer(tx: Prisma.TransactionClient, customerData: Prisma.CustomerUncheckedCreateInput): Promise<Customer> {
    return await tx.customer.create({
      data: customerData,
    });
  }

  async updateCustomer(id: string, data: Prisma.CustomerUpdateInput): Promise<Customer> {
    return await prisma.customer.update({
      where: { id },
      data,
    });
  }

  /**
   * Employees Queries
   */
  async findEmployees(search?: string): Promise<any[]> {
    const whereClause: Prisma.EmployeeWhereInput = {
      deletedAt: null,
    };

    if (search) {
      whereClause.OR = [
        { employeeCode: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
        { designation: { contains: search, mode: 'insensitive' } },
        {
          user: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    return await prisma.employee.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
            isActive: true,
          },
        },
        tasks: {
          select: {
            id: true,
            status: true,
          },
        },
        eventPlans: {
          select: {
            id: true,
            eventId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findEmployeeById(id: string): Promise<any | null> {
    return await prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
            isActive: true,
          },
        },
        tasks: {
          include: {
            event: true,
          },
          orderBy: {
            dueDate: 'asc',
          },
        },
      },
    });
  }

  async createEmployee(tx: Prisma.TransactionClient, employeeData: Prisma.EmployeeUncheckedCreateInput): Promise<Employee> {
    return await tx.employee.create({
      data: employeeData,
    });
  }

  async updateEmployee(id: string, data: Prisma.EmployeeUpdateInput): Promise<Employee> {
    return await prisma.employee.update({
      where: { id },
      data,
    });
  }

  /**
   * User Account Operations
   */
  async createUser(tx: Prisma.TransactionClient, userData: Prisma.UserCreateInput): Promise<User> {
    return await tx.user.create({
      data: userData,
    });
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }
}
