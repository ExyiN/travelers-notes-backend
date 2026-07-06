import { Injectable } from '@nestjs/common';
import { Region } from 'src/generated/prisma/client';
import { RegionOrderByWithRelationInput } from 'src/generated/prisma/models';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RegionsService {
  private orderBy: RegionOrderByWithRelationInput = {
    nameFr: 'asc',
  };

  constructor(private prisma: PrismaService) {}

  async getRegions(): Promise<Region[]> {
    return this.prisma.region.findMany({ orderBy: this.orderBy });
  }

  async getFilteredRegions(search: string): Promise<Region[]> {
    return this.prisma.region.findMany({
      where: {
        OR: [
          {
            nameFr: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            nameEn: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      },
      orderBy: this.orderBy,
    });
  }
}
