import { defineEventHandler, readBody } from 'h3'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const { query } = await readBody(event)

  // 검색 로직 구현
  const results = await searchAllContent(query)

  return results
})

// 모든 검색 결과를 가져오는 함수
async function searchAllContent(query) {
  const boardResults = await prisma.boardPost.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { content: { contains: query } }
      ]
    },
    select: {
      id: true,
      title: true,
      content: true,
    }
  })

  const blogResults = await prisma.blogPost.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { content: { contains: query } }
      ]
    },
    select: {
      id: true,
      title: true,
      content: true,
    }
  })

  const wikiResults = await prisma.wiki.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { content: { contains: query } }
      ]
    },
    select: {
      id: true,
      title: true,
      content: true,
    }
  })

  const galleryResults = await prisma.galleryItem.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
        { content: { contains: query } },
        { tags: { hasSome: [query] } }
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

  const qnaResults = await prisma.qnA.findMany({
    where: {
      OR: [
        { questionTitle: { contains: query } },
        { questionContent: { contains: query } },
        { answerContent: { contains: query } }
      ]
    },
    select: {
      id: true,
      questionTitle: true,
      questionContent: true,
      answerContent: true,
    }
  })

  const humorResults = await prisma.humorPost.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { content: { contains: query } }
      ]
    },
    select: {
      id: true,
      title: true,
      content: true,
    }
  })

  // 모든 검색 결과를 하나의 배열로 합침
  const allResults = [
    ...boardResults.map(r => ({ ...r, type: 'board', excerpt: r.content })),
    ...blogResults.map(r => ({ ...r, type: 'blog', excerpt: r.content })),
    ...wikiResults.map(r => ({ ...r, type: 'wiki', excerpt: r.content })),
    ...galleryResults.map(r => ({ ...r, type: 'gallery', excerpt: r.description || r.content, tags: r.tags })),
    ...qnaResults.map(r => ({ ...r, type: 'qna', title: r.questionTitle, excerpt: r.questionContent + ' ' + (r.answerContent || '') })),
    ...humorResults.map(r => ({ ...r, type: 'humor', excerpt: r.content }))
  ]

  // 결과 처리 및 포맷팅
  return allResults.map(result => ({
    id: result.id,
    title: result.title,
    excerpt: result.excerpt.substring(0, 100) + '...',
    type: getKoreanType(result.type),
    link: getLinkForType(result.type, result.id),
    tags: result.tags || []
  }))
}

// 검색 결과의 한국어 타입 반환
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

// 검색 결과의 링크 반환
function getLinkForType(type, id) {
  switch (type) {
    case 'board': return `/board/view?id=${id}`
    case 'blog': return `/blog/view?id=${id}`
    case 'wiki': return `/wiki/view?id=${id}`
    case 'gallery': return `/gallery?id=${id}`
    case 'qna': return `/qna/view?id=${id}`
    case 'humor': return `/humor/view?id=${id}`
    default: return '/'
  }
}