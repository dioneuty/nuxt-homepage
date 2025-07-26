
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * SQL 값 이스케이프 및 포맷팅을 처리합니다.
 * @param {*} value - SQL로 변환할 값
 * @param {string} type - Prisma 필드 타입 (예: 'String', 'Int', 'DateTime', 'Boolean', 'Json', 'BigInt')
 * @returns {string} 이스케이프된 SQL 값 문자열
 */
function escapeSqlValue(value, type) {
  if (value === null) {
    return 'NULL';
  }

  switch (type) {
    case 'String':
    case 'DateTime':
    case 'Json':
      // 문자열, 날짜, JSON 타입은 작은따옴표로 묶고 작은따옴표를 이스케이프 (SQL 표준)
      return '\'' + String(value).replace(/\\/g, '\\\\').replace(/'/g, '\'\'') + '\'';
    case 'Boolean':
      return value ? 'TRUE' : 'FALSE';
    case 'Int':
    case 'Float':
      return String(value);
    case 'BigInt':
      return '\'' + String(value) + '\''; // BigInt는 문자열로 저장
    // Note: Add support for Bytes, Decimal types as needed
    default:
      return '\'' + String(value).replace(/'/g, '\'\'\'\'\'\'\'\'\'') + '\'';
  }
}

/**
 * 주어진 Prisma 모델의 모든 레코드를 조회하고 SQL INSERT 문을 생성합니다.
 * @param {string} modelName - Prisma 모델 이름
 * @returns {Promise<string[]>} 생성된 SQL INSERT 문 배열
 */
export async function generateInsertSql(modelName) {
  const modelInfo = Prisma.dmmf.datamodel.models.find(m => m.name === modelName);
  if (!modelInfo) {
    throw new Error(`Model ${modelName} not found.`);
  }

  const records = await prisma[modelName].findMany();
  if (records.length === 0) {
    return [];
  }

  const columns = modelInfo.fields
    .filter(field => field.kind === 'scalar' || field.kind === 'enum') // 스칼라 및 enum 필드만 포함
    .map(field => `\"${field.dbName || field.name}\"`)
    .join(', ');

  const insertStatements = records.map(record => {
    const values = modelInfo.fields
      .filter(field => field.kind === 'scalar' || field.kind === 'enum')
      .map(field => escapeSqlValue(record[field.name], field.type))
      .join(', ');
    return `INSERT INTO \"${modelInfo.dbName || modelInfo.name}\" (${columns}) VALUES (${values});`;
  });

  return insertStatements;
}

/**
 * 모든 Prisma 모델의 이름과 필드 정보를 반환합니다.
 * @returns {Array<Object>} Prisma 모델 정보 배열
 */
export function getPrismaModels() {
  return Prisma.dmmf.datamodel.models.map(model => ({
    name: model.name,
    dbName: model.dbName || model.name,
    fields: model.fields.map(field => ({
      name: field.name,
      type: field.type,
      isId: field.isId,
      isRequired: field.isRequired,
      isUnique: field.isUnique,
      kind: field.kind,
      dbName: field.dbName || field.name,
    })),
  }));
}

export default prisma; 