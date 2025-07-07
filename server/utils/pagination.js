/**
 * @file 서버 사이드 페이지네이션 유틸리티
 * @description API 엔드포인트에서 반복되는 페이지네이션 로직을 통합하는 공통 유틸리티 함수들을 제공합니다.
 *              skip 계산, Promise.all 패턴, 결과 포맷팅을 포함한 완전한 페이지네이션 솔루션을 제공합니다.
 */

/**
 * 페이지네이션 매개변수를 계산하고 유효성을 검사합니다.
 * @param {number|string} page - 페이지 번호 (기본값: 1)
 * @param {number|string} limit - 페이지당 항목 수 (기본값: 10, 최대: 100)
 * @returns {object} 정규화된 페이지네이션 매개변수
 * @property {number} page - 정규화된 페이지 번호 (최소 1)
 * @property {number} limit - 정규화된 페이지당 항목 수 (1-100 사이)
 * @property {number} skip - 건너뛸 레코드 수
 */
export function calculatePagination(page = 1, limit = 10) {
  // 페이지 번호 정규화: 최소 1, 정수로 변환
  const normalizedPage = Math.max(1, parseInt(page) || 1)
  
  // 페이지당 항목 수 정규화: 1-100 사이, 정수로 변환
  const normalizedLimit = Math.max(1, Math.min(100, parseInt(limit) || 10))
  
  // 건너뛸 레코드 수 계산
  const skip = (normalizedPage - 1) * normalizedLimit
  
  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip
  }
}

/**
 * 페이지네이션된 쿼리를 실행하고 결과를 포맷팅합니다.
 * @param {object} model - Prisma 모델 (예: prisma.boardPost)
 * @param {object} options - 쿼리 옵션
 * @param {object} options.where - Prisma where 조건
 * @param {object} options.orderBy - Prisma orderBy 조건
 * @param {object} options.include - Prisma include 조건 (선택사항)
 * @param {object} options.select - Prisma select 조건 (선택사항)
 * @param {number|string} options.page - 페이지 번호
 * @param {number|string} options.limit - 페이지당 항목 수
 * @returns {Promise<object>} 페이지네이션된 결과
 */
export async function executePaginatedQuery(model, options) {
  const { where = {}, orderBy = {}, include, select, page, limit } = options
  
  // 페이지네이션 매개변수 계산
  const { page: normalizedPage, limit: normalizedLimit, skip } = calculatePagination(page, limit)
  
  // 쿼리 옵션 구성
  const findManyOptions = {
    where,
    orderBy,
    skip,
    take: normalizedLimit
  }
  
  // include와 select는 상호 배타적이므로 하나만 적용
  if (include) {
    findManyOptions.include = include
  } else if (select) {
    findManyOptions.select = select
  }
  
  // 데이터와 총 개수를 병렬로 조회
  const [data, total] = await Promise.all([
    model.findMany(findManyOptions),
    model.count({ where })
  ])
  
  return formatPaginationResult(data, total, normalizedPage, normalizedLimit)
}

/**
 * 페이지네이션 결과를 일관된 형식으로 포맷팅합니다.
 * @param {Array} data - 조회된 데이터 배열
 * @param {number} total - 전체 레코드 수
 * @param {number} page - 현재 페이지 번호
 * @param {number} limit - 페이지당 항목 수
 * @returns {object} 포맷팅된 페이지네이션 결과
 */
export function formatPaginationResult(data, total, page, limit) {
  const totalPages = Math.ceil(total / limit)
  
  return {
    posts: data, // 기존 API와의 호환성을 위해 'posts' 키 사용
    total,
    page,
    itemsPerPage: limit, // boardPosts.js와 호환성을 위해 itemsPerPage 사용
    limit, // humorPosts.js와 호환성을 위해 limit도 포함
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  }
}

/**
 * 간단한 페이지네이션 헬퍼 함수 (기본 정렬만 필요한 경우)
 * @param {object} model - Prisma 모델
 * @param {object} where - where 조건
 * @param {number|string} page - 페이지 번호
 * @param {number|string} limit - 페이지당 항목 수
 * @param {object} orderBy - 정렬 조건 (기본값: { id: 'desc' })
 * @returns {Promise<object>} 페이지네이션된 결과
 */
export async function simplePaginatedQuery(model, where = {}, page = 1, limit = 10, orderBy = { id: 'desc' }) {
  return await executePaginatedQuery(model, {
    where,
    orderBy,
    page,
    limit
  })
} 