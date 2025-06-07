import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const modelName = event.context.params?.model;

  if (!modelName || !Prisma.dmmf.datamodel.models.find(m => m.name.toLowerCase() === modelName.toLowerCase())) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid model name',
    });
  }

  try {
    const records = await prisma[modelName].findMany();
    return records;
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching records',
    });
  }
}); 