import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async () => {
  try {
    let config = await prisma.siteConfig.findFirst();
    if (!config) {
      // If no config exists, create a default one
      config = await prisma.siteConfig.create({
        data: {
          lightHeaderColor: '#FFFFFF', // Default white
          darkHeaderColor: '#1A202C', // Default dark gray-900
          lightFooterColor: '#F7FAFC', // Default gray-100
          darkFooterColor: '#1A202C', // Default dark gray-900
          lightBackgroundColor: '#FFFFFF', // Default white
          darkBackgroundColor: '#1A202C', // Default dark gray-900
        },
      });
    }
    return config;
  } catch (error) {
    console.error('Error fetching site config:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch site configuration',
    });
  }
}); 