import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const modelName = event.context.params?.model as string;
  const id = event.context.params?.id as string;
  const body = await readBody(event);

  const modelInfo = Prisma.dmmf.datamodel.models.find(m => m.name.toLowerCase() === modelName.toLowerCase());

  if (!modelName || !modelInfo) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid model name',
    });
  }

  // Convert BigInt fields from string to BigInt
  for (const field of modelInfo.fields) {
    if (field.type === 'BigInt' && body[field.name]) {
      try {
        body[field.name] = BigInt(body[field.name]);
      } catch (e) {
        throw createError({ statusCode: 400, statusMessage: `Invalid BigInt value for field ${field.name}` });
      }
    }
  }

  const idField = modelInfo.fields.find(f => f.isId);
  if (!idField) {
    throw createError({
      statusCode: 500,
      statusMessage: `Model ${modelName} does not have a primary key.`,
    });
  }
  
  let parsedId: number | string | bigint = id;
  if (idField.type === 'Int') {
    parsedId = parseInt(id, 10);
  } else if (idField.type === 'BigInt') {
    parsedId = BigInt(id);
  }

  try {
    const updatedRecord = await (prisma as any)[modelName].update({
      where: {
        [idField.name]: parsedId,
      },
      data: body,
    });
    return updatedRecord;
  } catch (error: any) {
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Error updating record',
    });
  }
}); 