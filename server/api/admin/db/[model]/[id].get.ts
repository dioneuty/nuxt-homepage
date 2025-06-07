import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const modelName = event.context.params?.model as string;
  const id = event.context.params?.id as string;

  const modelInfo = Prisma.dmmf.datamodel.models.find(m => m.name.toLowerCase() === modelName.toLowerCase());

  if (!modelName || !modelInfo) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid model name',
    });
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
    const record = await (prisma as any)[modelName].findUnique({
      where: {
        [idField.name]: parsedId,
      },
    });

    if (!record) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Record not found',
      });
    }

    return record;
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching record',
    });
  }
}); 