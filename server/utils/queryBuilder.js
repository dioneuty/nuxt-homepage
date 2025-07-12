/**
 * @file 검색 조건 빌더 유틸리티
 * @description API에서 반복되는 검색 및 필터링 로직을 통합하는 공통 유틸리티 함수들을 제공합니다.
 *              다양한 검색 타입과 조건을 처리하고 Prisma where 절을 동적으로 구성합니다.
 */

/**
 * 게시판 타입별 필드 매핑 정보
 * QnA와 같이 특수한 필드명을 가진 게시판을 위한 매핑
 */
const BOARD_FIELD_MAPPING = {
  qna: {
    title: 'questionTitle',
    content: 'questionContent'
  },
  freeboard: {
    title: 'title',
    content: 'content'
  },
  humor: {
    title: 'title',
    content: 'content'
  },
  default: {
    title: 'title',
    content: 'content'
  }
}

export function buildSearchCondition(searchType, searchText, boardType = 'default') {
  if (!searchText?.trim()) return {}

  const condition = { contains: searchText.trim(), mode: 'insensitive' }
  const fieldMapping = BOARD_FIELD_MAPPING[boardType] || BOARD_FIELD_MAPPING.default

  const searchMap = {
    title: { [fieldMapping.title]: condition },
    content: { [fieldMapping.content]: condition },
    author: { author: condition },
    all: {
      OR: [
        { [fieldMapping.title]: condition },
        { [fieldMapping.content]: condition },
        { author: condition }
      ]
    }
  }

  return searchMap[searchType] || {}
}

/**
 * 복합 where 절을 구성합니다.
 * @param {object} searchParams - 검색 매개변수 { type, text }
 * @param {object} additionalConditions - 추가 조건들
 * @param {string} boardType - 게시판 타입 (선택사항)
 * @returns {object} 완성된 Prisma where 조건
 */
export function buildWhereClause(searchParams = {}, additionalConditions = {}, boardType = 'default') {
  const { type, text } = searchParams
  
  // 검색 조건 생성
  const searchCondition = buildSearchCondition(type, text, boardType)
  
  // 검색 조건과 추가 조건 병합
  return { ...searchCondition, ...additionalConditions }
}

/**
 * 정렬 조건을 생성합니다.
 * @param {string} sortColumn - 정렬할 컬럼명
 * @param {string} sortOrder - 정렬 순서 ('asc' 또는 'desc')
 * @param {object} defaultSort - 기본 정렬 조건 (기본값: { id: 'desc' })
 * @returns {object} Prisma orderBy 조건
 */
export function buildOrderBy(sortColumn, sortOrder, defaultSort = { id: 'desc' }) {
  // 정렬 컬럼과 순서가 모두 제공된 경우
  if (sortColumn && sortOrder) {
    // 정렬 순서 정규화
    const normalizedOrder = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc'
    return { [sortColumn]: normalizedOrder }
  }
  
  // 기본 정렬 반환
  return defaultSort
}

/**
 * 복합 쿼리 조건을 구성하는 헬퍼 함수
 * @param {object} options - 쿼리 옵션
 * @param {object} options.searchParams - 검색 매개변수 { type, text }
 * @param {string} options.sortColumn - 정렬 컬럼
 * @param {string} options.sortOrder - 정렬 순서
 * @param {object} options.additionalConditions - 추가 where 조건
 * @param {object} options.defaultSort - 기본 정렬 조건
 * @param {string} options.boardType - 게시판 타입
 * @returns {object} { where, orderBy } 조건 객체
 */
export function buildQueryConditions(options = {}) {
  const {
    searchParams = {},
    sortColumn,
    sortOrder,
    additionalConditions = {},
    defaultSort = { id: 'desc' },
    boardType = 'default'
  } = options

  const where = buildWhereClause(searchParams, additionalConditions, boardType)
  const orderBy = buildOrderBy(sortColumn, sortOrder, defaultSort)

  return { where, orderBy }
}

/**
 * 게시판별 특수 검색 조건을 처리합니다.
 * @param {string} boardType - 게시판 타입
 * @param {object} searchParams - 검색 매개변수
 * @param {object} additionalConditions - 추가 조건
 * @returns {object} 게시판별 최적화된 where 조건
 */
export function buildBoardSpecificWhere(boardType, searchParams = {}, additionalConditions = {}) {
  const { type, text } = searchParams

  switch (boardType) {
    case 'qna':
      // QnA는 특수 필드명 사용
      if (text && !type) {
        // 타입이 지정되지 않은 경우 전체 검색
        return {
          ...additionalConditions,
          OR: [
            { author: { contains: text, mode: 'insensitive' } },
            { questionTitle: { contains: text, mode: 'insensitive' } },
            { questionContent: { contains: text, mode: 'insensitive' } }
          ]
        }
      }
      return buildWhereClause(searchParams, additionalConditions, 'qna')
      
    case 'freeboard':
      // 자유게시판은 parentId가 null인 것만 조회 (답글 제외)
      const baseConditions = { ...additionalConditions, parentId: null }
      return buildWhereClause(searchParams, baseConditions, 'freeboard')
      
    case 'humor':
      return buildWhereClause(searchParams, additionalConditions, 'humor')
      
    default:
      return buildWhereClause(searchParams, additionalConditions)
  }
}

/**
 * 검색 매개변수 유효성 검사
 * @param {object} searchParams - 검색 매개변수
 * @returns {object} 정규화된 검색 매개변수
 */
export function validateSearchParams(searchParams = {}) {
  const { type, text } = searchParams
  
  // 유효한 검색 타입들
  const validTypes = ['title', 'content', 'author', 'all']
  
  return {
    type: validTypes.includes(type) ? type : 'title',
    text: typeof text === 'string' ? text.trim() : ''
  }
} 