import { Prisma } from '@prisma/client';

export default defineEventHandler((event) => {
  const models = Prisma.dmmf.datamodel.models.map(model => ({
    name: model.name,
    fields: model.fields.map(field => ({
      name: field.name,
      type: field.type,
      isId: field.isId,
      isRequired: field.isRequired,
      isUnique: field.isUnique,
      kind: field.kind,
    })),
  }));

  return {
    models,
  };
}); 