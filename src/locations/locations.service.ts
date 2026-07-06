import { Injectable } from '@nestjs/common';
import { Location } from 'src/generated/prisma/client';
import { LocationOrderByWithRelationInput } from 'src/generated/prisma/models';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LocationsService {
  private orderBy: LocationOrderByWithRelationInput[] = [
    { region: { nameFr: 'asc' } },
    { level: { sort: 'asc', nulls: 'first' } },
  ];

  constructor(private prisma: PrismaService) {}

  async getLocations(): Promise<Location[]> {
    return this.prisma.location.findMany({
      orderBy: this.orderBy,
    });
  }

  async getFilteredLocations(search: string): Promise<Location[]> {
    return this.prisma.location.findMany({
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
          {
            level: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            region: {
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
          },
        ],
      },
      orderBy: this.orderBy,
    });
  }
}
