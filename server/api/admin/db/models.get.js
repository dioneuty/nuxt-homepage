import { Prisma } from '@prisma/client';
import { handleApiError } from '~/server/utils/apiErrorHandlers';

/**
 * @file 관리자 DB 모델 정보 조회 API
 * @description Prisma의 DMMF(Declarative Datamodel Framework)를 사용하여 데이터베이스 모델의 구조와 필드 정보를 조회합니다.
 *              이는 관리자 페이지에서 동적으로 데이터베이스 모델을 탐색하고 관리하는 데 사용될 수 있습니다.
 */
export default defineEventHandler((event) => {
  try {
    // Prisma DMMF에서 데이터 모델 목록을 가져와 필요한 필드만 추출하여 매핑합니다.
    const models = Prisma.dmmf.datamodel.models.map(model => ({
      name: model.name, // 모델의 이름
      fields: model.fields.map(field => ({
        name: field.name, // 필드 이름
        type: field.type, // 필드 타입 (예: String, Int, DateTime)
        isId: field.isId, // ID 필드인지 여부
        isRequired: field.isRequired, // 필수 필드인지 여부
        isUnique: field.isUnique, // 고유(Unique) 필드인지 여부
        kind: field.kind, // 필드 종류 (예: scalar, object)
      })),
    }));
  
    // 추출된 모델 정보를 반환합니다.
    return {
      models,
    };
  } catch (error) {
    return handleApiError(event, 500, 'DB 모델 정보를 불러오는 중 오류가 발생했습니다.', error);
  }
}); 