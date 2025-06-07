import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { lightHeaderColor, darkHeaderColor, lightFooterColor, darkFooterColor, lightBackgroundColor, darkBackgroundColor } = body;

  if (!lightHeaderColor && !darkHeaderColor && !lightFooterColor && !darkFooterColor && !lightBackgroundColor && !darkBackgroundColor) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No color data provided',
    });
  }

  try {
    let config = await prisma.siteConfig.findFirst();

    if (!config) {
      // If no config exists, create a default one
      config = await prisma.siteConfig.create({
        data: {
          lightHeaderColor: lightHeaderColor || '#FFFFFF',
          darkHeaderColor: darkHeaderColor || '#1A202C',
          lightFooterColor: lightFooterColor || '#F7FAFC',
          darkFooterColor: darkFooterColor || '#1A202C',
          lightBackgroundColor: lightBackgroundColor || '#FFFFFF',
          darkBackgroundColor: darkBackgroundColor || '#1A202C',
        },
      });
    } else {
      // Update existing config
      config = await prisma.siteConfig.update({
        where: { id: config.id },
        data: {
          lightHeaderColor: lightHeaderColor || config.lightHeaderColor,
          darkHeaderColor: darkHeaderColor || config.darkHeaderColor,
          lightFooterColor: lightFooterColor || config.lightFooterColor,
          darkFooterColor: darkFooterColor || config.darkFooterColor,
          lightBackgroundColor: lightBackgroundColor || config.lightBackgroundColor,
          darkBackgroundColor: darkBackgroundColor || config.darkBackgroundColor,
        },
      });
    }
    return config;
  } catch (error) {
    console.error('Error updating site config:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update site configuration',
    });
  }
}); 