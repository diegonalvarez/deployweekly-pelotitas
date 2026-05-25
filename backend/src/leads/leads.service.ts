import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BrochureLeadStatus } from '@prisma/client';

export interface CreateLeadInput {
  email: string;
  phone?: string;
  fullName?: string;
  clubName?: string;
  comment?: string;
  source?: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateLeadInput) {
    return this.prisma.brochureLead.create({
      data: {
        ...data,
        email: data.email.trim().toLowerCase(),
      },
      select: { id: true, createdAt: true },
    });
  }

  list(query: { status?: BrochureLeadStatus; page?: number; limit?: number }) {
    const { status, page = 1, limit = 50 } = query;
    const where = status ? { status } : {};
    const skip = (page - 1) * limit;
    return Promise.all([
      this.prisma.brochureLead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.brochureLead.count({ where }),
    ]).then(([items, total]) => ({
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }));
  }

  async update(
    id: string,
    userId: string,
    data: { status?: BrochureLeadStatus; notes?: string },
  ) {
    const existing = await this.prisma.brochureLead.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Lead not found');
    const next: any = { ...data };
    if (data.status === 'CONTACTED' && !existing.contactedAt) {
      next.contactedAt = new Date();
      next.contactedById = userId;
    }
    return this.prisma.brochureLead.update({ where: { id }, data: next });
  }

  async stats() {
    const rows = await this.prisma.brochureLead.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    const out: Record<string, number> = { NEW: 0, CONTACTED: 0, QUALIFIED: 0, CONVERTED: 0, DEAD: 0 };
    for (const r of rows) out[r.status] = r._count._all;
    return { byStatus: out, total: Object.values(out).reduce((a, b) => a + b, 0) };
  }
}
