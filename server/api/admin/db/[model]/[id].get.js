import { PrismaClient, Prisma } from '@prisma/client';
import { handleApiError } from '~/server/utils/apiErrorHandlers';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const modelName = event.context.params?.model;
  const id = event.context.params?.id;

  const modelInfo = Prisma.dmmf.datamodel.models.find(m => m.name.toLowerCase() === modelName.toLowerCase());

  if (!modelName || !modelInfo) {
    return handleApiError(event, 400, 'Invalid model name');
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
    const record = await prisma[modelName].findUnique({
      where: {
        [idField.name]: parsedId,
      },
    });

    if (!record) {
      return handleApiError(event, 404, 'Record not found');
    }

    return record;
  } catch (error) {
    handleApiError(event, 500, 'Error fetching record', error);
  }
}); 