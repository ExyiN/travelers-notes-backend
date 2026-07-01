import { Injectable } from '@nestjs/common';
import { Prisma, Region } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RegionsService {
  constructor(private prisma: PrismaService) {}

  async region(
    regionWhereUniqueInput: Prisma.RegionWhereUniqueInput,
  ): Promise<Region | null> {
    return this.prisma.region.findUnique({
      where: regionWhereUniqueInput,
    });
  }

  async regions(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.RegionWhereUniqueInput;
    where?: Prisma.RegionWhereInput;
    orderBy?: Prisma.RegionOrderByWithRelationInput;
  }): Promise<Region[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.region.findMany({ skip, take, cursor, where, orderBy });
  }

  async createRegion(data: Prisma.RegionCreateInput): Promise<Region> {
    return this.prisma.region.create({ data });
  }

  async updateRegion(
    where: Prisma.RegionWhereUniqueInput,
    data: Prisma.RegionUpdateInput,
  ): Promise<Region> {
    return this.prisma.region.update({ data, where });
  }

  async deleteRegion(where: Prisma.RegionWhereUniqueInput): Promise<Region> {
    return this.prisma.region.delete({ where });
  }
}
