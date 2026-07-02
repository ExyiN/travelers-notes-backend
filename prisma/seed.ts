import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from 'src/generated/prisma/client';
import worldData from './world-data.json';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface LocationData {
  nameFr: string;
  nameEn: string;
  level: string | null;
}

interface RegionData {
  nameFr: string;
  nameEn: string;
  locations: LocationData[];
}

async function main() {
  for (const regionData of worldData as RegionData[]) {
    const region = await prisma.region.upsert({
      where: {
        nameFr_nameEn: {
          nameFr: regionData.nameFr,
          nameEn: regionData.nameEn,
        },
      },
      update: {},
      create: {
        nameFr: regionData.nameFr,
        nameEn: regionData.nameEn,
      },
    });

    for (const locationData of regionData.locations) {
      await prisma.location.upsert({
        where: {
          nameFr_nameEn: {
            nameFr: locationData.nameFr,
            nameEn: locationData.nameEn,
          },
        },
        update: {},
        create: {
          nameFr: locationData.nameFr,
          nameEn: locationData.nameEn,
          level: locationData.level,
          regionId: region.id,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
