import prisma from './prisma'

export function getBoardModel(boardType) {
  switch (boardType) {
    case 'freeboard':
      return prisma.boardPost
    case 'humor':
      return prisma.humorPost
    case 'qna':
      return prisma.qnA
    default:
      throw new Error(`Unknown board type: ${boardType}`)
  }
}

export function getBoardConfig(boardType) {
  switch (boardType) {
    case 'freeboard':
      return { name: '자유게시판', description: '누구나 자유롭게 글을 작성하는 게시판입니다.' }
    case 'humor':
      return { name: '유머게시판', description: '재미있는 유머 글을 공유하는 게시판입니다.' }
    case 'qna':
      return { name: 'Q&A 게시판', description: '질문과 답변을 하는 게시판입니다.' }
    default:
      return null
  }
} 