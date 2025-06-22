import { PrismaClient, Prisma } from '@prisma/client';
import { handleApiError } from '~/server/utils/apiErrorHandlers';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const modelName = event.context.params?.model;
  const id = event.context.params?.id;
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

  const idField = modelInfo.fields.find(f => f.isId);
  if (!idField) {
    return handleApiError(event, 500, `Model ${modelName} does not have a primary key.`);
  }
  
  let parsedId = id;
  if (idField.type === 'Int') {
    parsedId = parseInt(id, 10);
  } else if (idField.type === 'BigInt') {
    try {
      parsedId = BigInt(id);
    } catch (e) {
      return handleApiError(event, 400, `Invalid ID value for field ${idField.name}`, e);
    }
  }

  try {
    const updatedRecord = await prisma[modelName].update({
      where: {
        [idField.name]: parsedId,
      },
      data: body,
    });
    return updatedRecord;
  } catch (error) {
    handleApiError(event, 500, error.message || 'Error updating record', error);
  }
}); 