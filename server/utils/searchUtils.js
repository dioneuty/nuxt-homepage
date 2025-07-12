/**
 * 검색 유틸리티 - 반복적인 검색 로직 통합
 */
import prisma from '~/server/utils/prisma'

/**
 * 검색 설정 정의
 */
const SEARCH_CONFIGS = {
  board: {
    model: 'boardPost',
    fields: ['title', 'content'],
    select: { id: true, title: true, content: true },
    mapResult: (r) => ({ ...r, type: 'board', excerpt: r.content })
  },
  blog: {
    model: 'blogPost',
    fields: ['title', 'content'],
    select: { id: true, title: true, content: true },
    mapResult: (r) => ({ ...r, type: 'blog', excerpt: r.content })
  },
  wiki: {
    model: 'wiki',
    fields: ['title', 'content'],
    select: { id: true, title: true, content: true },
    mapResult: (r) => ({ ...r, type: 'wiki', excerpt: r.content })
  },
  gallery: {
    model: 'galleryItem',
    fields: ['title', 'description', 'content'],
    specialFields: { tags: { hasSome: true } },
    select: { id: true, title: true, description: true, content: true, tags: true },
    mapResult: (r) => ({ ...r, type: 'gallery', excerpt: r.description || r.content, tags: r.tags })
  },
  qna: {
    model: 'qnA',
    fields: ['questionTitle', 'questionContent', 'answerContent'],
    select: { id: true, questionTitle: true, questionContent: true, answerContent: true },
    mapResult: (r) => ({ 
      ...r, 
      type: 'qna', 
      title: r.questionTitle, 
      excerpt: r.questionContent + ' ' + (r.answerContent || '') 
    })
  },
  humor: {
    model: 'humorPost',
    fields: ['title', 'content'],
    select: { id: true, title: true, content: true },
    mapResult: (r) => ({ ...r, type: 'humor', excerpt: r.content })
  }
}

/**
 * 단일 모델에서 검색 수행
 */
async function searchInModel(config, query) {
  const { model, fields, specialFields, select, mapResult } = config
  
  // OR 조건 생성
  const orConditions = fields.map(field => ({
    [field]: { contains: query, mode: 'insensitive' }
  }))
  
  // 특수 필드 처리 (예: 태그)
  if (specialFields) {
    Object.entries(specialFields).forEach(([field, condition]) => {
      if (condition.hasSome) {
        orConditions.push({ [field]: { hasSome: [query] } })
      }
    })
  }
  
  const results = await prisma[model].findMany({
    where: { OR: orConditions },
    select
  })
  
  return results.map(mapResult)
}

/**
 * 모든 모델에서 검색 수행
 */
export async function searchAllContent(query) {
  const searchPromises = Object.values(SEARCH_CONFIGS).map(config => 
    searchInModel(config, query)
  )
  
  const results = await Promise.all(searchPromises)
  const allResults = results.flat()
  
  return allResults.map(result => ({
    id: result.id,
    title: result.title,
    excerpt: (result.excerpt || '').substring(0, 100) + '...',
    type: getKoreanType(result.type),
    link: getLinkForType(result.type, result.id),
    tags: result.tags || []
  }))
}

/**
 * 타입을 한국어로 변환
 */
const TYPE_KOREAN_MAP = {
  board: '게시판',
  blog: '블로그',
  wiki: '위키',
  gallery: '갤러리',
  qna: '질문과 답변',
  humor: '유머게시판'
}

export function getKoreanType(type) {
  return TYPE_KOREAN_MAP[type] || '기타'
}

/**
 * 링크 생성
 */
const LINK_MAP = {
  board: (id) => `/board/view?id=${id}`,
  blog: (id) => `/blog/view?id=${id}`,
  wiki: (id) => `/wiki/view?id=${id}`,
  gallery: (id) => `/gallery?id=${id}`,
  qna: (id) => `/qna/view?id=${id}`,
  humor: (id) => `/humor/view?id=${id}`
}

export function getLinkForType(type, id) {
  return LINK_MAP[type]?.(id) || '/'
} 