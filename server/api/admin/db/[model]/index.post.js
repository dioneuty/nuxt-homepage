import { PrismaClient, Prisma } from '@prisma/client';
import { handleApiError } from '~/server/utils/apiErrorHandlers';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const modelName = event.context.params?.model;
  const body = await readBody(event);

  const modelInfo = Prisma.dmmf.datamodel.models.find(m => m.name.toLowerCase() === modelName.toLowerCase());

  if (!modelName || !modelInfo) {
    return handleApiError(event, 400, 'Invalid model name');
  }

  // Convert BigInt fields from string to BigInt
  for (const field of modelInfo.fields) {
    if (field.type === 'BigInt' && body[field.name]) {
      try {
        body[field.name] = BigInt(body[field.name]);
      } catch (e) {
        return handleApiError(event, 400, `Invalid BigInt value for field ${field.name}`, e);
      }
    }
  }

  try {
    const createdRecord = await prisma[modelName].create({
      data: body,
    });
    return createdRecord;
  } catch (error) {
    handleApiError(event, 500, error.message || 'Error creating record', error);
  }
}); 