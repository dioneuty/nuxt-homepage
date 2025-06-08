import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const relatedSites = await prisma.relatedSite.findMany({
      orderBy: {
        order: 'asc',
      },
    });
    return relatedSites;
  } catch (error) {
    console.error('Error fetching public related sites:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch related sites.',
    });
  }
}); 