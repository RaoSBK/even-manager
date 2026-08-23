import { PrismaClient, Vendor, VendorStatus, Prisma, VendorService } from '@prisma/client';
import prisma from '../config/database';

export class VendorRepository {
  async findAll(filters: { search?: string; category?: string; status?: VendorStatus } = {}): Promise<Vendor[]> {
    const where: Prisma.VendorWhereInput = { deletedAt: null };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { vendorCode: { contains: filters.search, mode: 'insensitive' } },
        { companyName: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search } }
      ];
    }

    if (filters.category) {
      where.services = {
        some: {
          name: { contains: filters.category, mode: 'insensitive' }
        }
      };
    }

    return await prisma.vendor.findMany({
      where,
      include: {
        services: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string): Promise<(Vendor & { services: VendorService[] }) | null> {
    return await prisma.vendor.findFirst({
      where: { id, deletedAt: null },
      include: {
        services: true
      }
    });
  }

  async create(data: Prisma.VendorCreateInput): Promise<Vendor> {
    return await prisma.vendor.create({ data });
  }

  async update(id: string, data: Prisma.VendorUpdateInput): Promise<Vendor> {
    return await prisma.vendor.update({
      where: { id },
      data
    });
  }

  async softDelete(id: string): Promise<Vendor> {
    return await prisma.vendor.update({
      where: { id },
      data: { deletedAt: new Date(), status: VendorStatus.INACTIVE }
    });
  }

  async createService(vendorId: string, data: Prisma.VendorServiceCreateWithoutVendorInput): Promise<VendorService> {
    return await prisma.vendorService.create({
      data: {
        ...data,
        vendor: { connect: { id: vendorId } }
      }
    });
  }

  async deleteServices(vendorId: string): Promise<void> {
    await prisma.vendorService.deleteMany({
      where: { vendorId }
    });
  }
}
