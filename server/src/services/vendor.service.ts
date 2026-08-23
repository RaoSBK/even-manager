import { VendorRepository } from '../repositories/vendor.repository';
import { Vendor, VendorStatus, VendorService as VService } from '@prisma/client';

export class VendorService {
  private vendorRepo = new VendorRepository();

  async getAll(filters: { search?: string; category?: string; status?: string } = {}): Promise<Vendor[]> {
    const status = filters.status ? (filters.status as VendorStatus) : undefined;
    return await this.vendorRepo.findAll({
      search: filters.search,
      category: filters.category,
      status
    });
  }

  async getById(id: string): Promise<Vendor & { services: VService[] }> {
    const vendor = await this.vendorRepo.findById(id);
    if (!vendor) throw new Error('VENDOR_NOT_FOUND');
    return vendor;
  }

  async create(data: {
    name: string;
    companyName?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    status?: string;
    notes?: string;
    services?: Array<{ name: string; description?: string; basePrice?: number }>;
  }): Promise<Vendor> {
    const vendorCode = 'VND' + Math.floor(1000 + Math.random() * 9000);
    const vendorStatus = data.status ? (data.status as VendorStatus) : VendorStatus.ACTIVE;

    const vendor = await this.vendorRepo.create({
      vendorCode,
      name: data.name,
      companyName: data.companyName,
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city,
      state: data.state,
      status: vendorStatus,
      notes: data.notes
    });

    if (data.services && data.services.length > 0) {
      for (const svc of data.services) {
        await this.vendorRepo.createService(vendor.id, {
          name: svc.name,
          description: svc.description,
          basePrice: svc.basePrice
        });
      }
    }

    return vendor;
  }

  async update(
    id: string,
    data: {
      name: string;
      companyName?: string;
      phone?: string;
      email?: string;
      address?: string;
      city?: string;
      state?: string;
      status?: string;
      notes?: string;
      services?: Array<{ name: string; description?: string; basePrice?: number }>;
    }
  ): Promise<Vendor> {
    const vendorStatus = data.status ? (data.status as VendorStatus) : undefined;
    const vendor = await this.vendorRepo.update(id, {
      name: data.name,
      companyName: data.companyName,
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city,
      state: data.state,
      status: vendorStatus,
      notes: data.notes
    });

    if (data.services) {
      await this.vendorRepo.deleteServices(id);
      for (const svc of data.services) {
        await this.vendorRepo.createService(id, {
          name: svc.name,
          description: svc.description,
          basePrice: svc.basePrice
        });
      }
    }

    return vendor;
  }

  async delete(id: string): Promise<Vendor> {
    return await this.vendorRepo.softDelete(id);
  }
}
