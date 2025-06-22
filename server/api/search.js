import { defineEventHandler, readBody } from 'h3'
import prisma from '~/server/utils/prisma'
import { handleApiError } from '~/server/utils/apiErrorHandlers'

/**
 * @file 통합 검색 API
 * @description 웹사이트의 다양한 콘텐츠 (게시판, 블로그, 위키, 갤러리, QnA, 유머 게시판)에서
 *              주어진 검색어에 해당하는 내용을 찾아 반환합니다.
 */
export default defineEventHandler(async (event) => {
  // 요청 본문에서 검색 쿼리(query)를 읽어옵니다.
  const { query } = await readBody(event)

  try {
    // 모든 콘텐츠 유형에 걸쳐 검색을 수행합니다.
    const results = await searchAllContent(query)

    // 검색 결과를 반환합니다.
    return results
  } catch (error) {
    handleApiError(error, '통합 검색 중 오류가 발생했습니다.', 500);
  }
})

/**
 * @function searchAllContent
 * @description Prisma를 사용하여 여러 데이터베이스 모델(BoardPost, BlogPost, Wiki, GalleryItem, QnA, HumorPost)에서
 *              검색어에 해당하는 콘텐츠를 조회합니다.
 * @param {string} query - 사용자가 입력한 검색어
 * @returns {Array<object>} 각 콘텐츠 유형별 검색 결과를 통합하고 포맷팅한 배열
 */
async function searchAllContent(query) {
  // 게시판 게시물 검색: 제목 또는 내용에 검색어가 포함된 경우
  const boardResults = await prisma.boardPost.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } }, // 대소문자 구분 없이 검색
        { content: { contains: query, mode: 'insensitive' } }
      ]
    },
    select: { // 필요한 필드만 선택
      id: true,
      title: true,
      content: true,
    }
  })

  // 블로그 게시물 검색: 제목 또는 내용에 검색어가 포함된 경우
  const blogResults = await prisma.blogPost.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      title: true,
      content: true,
    }
  })

  // 위키 항목 검색: 제목 또는 내용에 검색어가 포함된 경우
  const wikiResults = await prisma.wiki.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      title: true,
      content: true,
    }
  })

  // 갤러리 항목 검색: 제목, 설명, 내용 또는 태그에 검색어가 포함된 경우
  const galleryResults = await prisma.galleryItem.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { tags: { hasSome: [query] } } // 태그 검색은 정확한 일치 (대소문자 구분 없음)
      ]
    },
    select: {
      id: true,
      title: true,
      description: true,
      content: true,
      tags: true,
    }
  })

  // QnA 항목 검색: 질문 제목, 질문 내용 또는 답변 내용에 검색어가 포함된 경우
  const qnaResults = await prisma.qnA.findMany({
    where: {
      OR: [
        { questionTitle: { contains: query, mode: 'insensitive' } },
        { questionContent: { contains: query, mode: 'insensitive' } },
        { answerContent: { contains: query, mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      questionTitle: true,
      questionContent: true,
      answerContent: true,
    }
  })

  // 유머 게시물 검색: 제목 또는 내용에 검색어가 포함된 경우
  const humorResults = await prisma.humorPost.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      title: true,
      content: true,
    }
  })

  // 모든 검색 결과를 하나의 배열로 합치고, 각 결과에 'type'과 'excerpt' 필드를 추가합니다.
  const allResults = [
    ...boardResults.map(r => ({ ...r, type: 'board', excerpt: r.content })),
    ...blogResults.map(r => ({ ...r, type: 'blog', excerpt: r.content })),
    ...wikiResults.map(r => ({ ...r, type: 'wiki', excerpt: r.content })),
    // 갤러리 항목은 설명(description)이 없으면 내용(content)을 발췌로 사용합니다.
    ...galleryResults.map(r => ({ ...r, type: 'gallery', excerpt: r.description || r.content, tags: r.tags })),
    // QnA는 질문 제목을 타이틀로, 질문 내용과 답변 내용을 합쳐 발췌로 사용합니다.
    ...qnaResults.map(r => ({ ...r, type: 'qna', title: r.questionTitle, excerpt: r.questionContent + ' ' + (r.answerContent || '') })),
    ...humorResults.map(r => ({ ...r, type: 'humor', excerpt: r.content }))
  ]

  // 최종 검색 결과 처리 및 포맷팅: 발췌 길이 제한, 한국어 타입, 링크 추가
  return allResults.map(result => ({
    id: result.id,
    title: result.title,
    // 발췌 내용을 100자로 제한하고 "..."을 추가합니다.
    excerpt: result.excerpt.substring(0, 100) + '...',
    type: getKoreanType(result.type),
    link: getLinkForType(result.type, result.id),
    tags: result.tags || []
  }))
}

/**
 * @function getKoreanType
 * @description 영문 콘텐츠 타입을 한국어 이름으로 변환합니다.
 * @param {string} type - 영문 콘텐츠 타입 (예: 'board', 'blog')
 * @returns {string} 해당 콘텐츠의 한국어 이름
 */
function getKoreanType(type) {
  switch (type) {
    case 'board': return '게시판'
    case 'blog': return '블로그'
    case 'wiki': return '위키'
    case 'gallery': return '갤러리'
    case 'qna': return '질문과 답변'
    case 'humor': return '유머게시판'
    default: return '기타'
  }
}

/**
 * @function getLinkForType
 * @description 콘텐츠 타입과 ID를 기반으로 해당 콘텐츠의 상세 페이지 링크를 생성합니다.
 * @param {string} type - 콘텐츠 타입
 * @param {number} id - 콘텐츠 ID
 * @returns {string} 콘텐츠 상세 페이지로 이동하는 URL
 */
function getLinkForType(type, id) {
  switch (type) {
    case 'board': return `/board/view?id=${id}`
    case 'blog': return `/blog/view?id=${id}`
    case 'wiki': return `/wiki/view?id=${id}`
    case 'gallery': return `/gallery?id=${id}`
    case 'qna': return `/qna/view?id=${id}`
    case 'humor': return `/humor/view?id=${id}`
    default: return '/' // 기본적으로 홈페이지로 이동
  }
}