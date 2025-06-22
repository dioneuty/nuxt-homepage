import { PrismaClient, Prisma } from '@prisma/client';
import { handleApiError } from '~/server/utils/apiErrorHandlers';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const modelName = event.context.params?.model;

  if (!modelName || !Prisma.dmmf.datamodel.models.find(m => m.name.toLowerCase() === modelName.toLowerCase())) {
    return handleApiError(event, 400, 'Invalid model name');
  }

  try {
    const records = await prisma[modelName].findMany();
    return records;
  } catch (error) {
    handleApiError(event, 500, 'Error fetching records', error);
  }
}); 