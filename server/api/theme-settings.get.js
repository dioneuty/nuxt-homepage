import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async () => {
  try {
    const config = await prisma.siteConfig.findFirst();
    return config || {
      lightHeaderColor: '#FFFFFF',
      darkHeaderColor: '#1A202C',
      lightFooterColor: '#F7FAFC',
      darkFooterColor: '#1A202C',
    };
  } catch (error) {
    console.error('Error fetching public site config:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch site configuration',
    });
  }
}); 