import { Injectable } from '@nestjs/common';
import { Location, Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async location(
    locationWhereUniqueInput: Prisma.LocationWhereUniqueInput,
  ): Promise<Location | null> {
    return this.prisma.location.findUnique({
      where: locationWhereUniqueInput,
    });
  }

  async locations(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.LocationWhereUniqueInput;
    where?: Prisma.LocationWhereInput;
    orderBy?: Prisma.LocationOrderByWithRelationInput;
  }): Promise<Location[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.location.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createLocation(data: Prisma.LocationCreateInput): Promise<Location> {
    return this.prisma.location.create({ data });
  }

  async updateLocation(
    where: Prisma.LocationWhereUniqueInput,
    data: Prisma.LocationUpdateInput,
  ): Promise<Location> {
    return this.prisma.location.update({ data, where });
  }

  async deleteLocation(
    where: Prisma.LocationWhereUniqueInput,
  ): Promise<Location> {
    return this.prisma.location.delete({ where });
  }
}
