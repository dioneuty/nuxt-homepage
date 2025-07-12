import prisma from '~/server/utils/prisma'
import { handleApiError } from '~/server/utils/apiErrorHandlers'
import { executePaginatedQuery } from '~/server/utils/pagination'

// 유머 게시판 API
export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  if (method === 'GET') {
    const { id, page = 1, limit = 10 } = getQuery(event)
    
    if (id) {
      const post = await prisma.humorPost.findUnique({ where: { id: parseInt(id) } })
      if (!post) handleApiError(event, 404, '유머 게시글을 찾을 수 없습니다')
      return post;
    }

    return await executePaginatedQuery(prisma.humorPost, {
      where: {},
      orderBy: { createdAt: 'desc' },
      page,
      limit
    })
  }

  if (method === 'POST') {
    const { title, content, author } = await readBody(event)
    try {
      const result = await prisma.humorPost.create({ data: { title, content, author } })
      return { success: true, id: result.id }
    } catch (error) {
      handleApiError(event, 500, '유머 게시글 생성 실패', error);
    }
  }

  if (method === 'PUT') {
    const { id } = await readBody(event)
    try {
      const updatedPost = await prisma.humorPost.update({
        where: { id: parseInt(id) },
        data: { likes: { increment: 1 } }
      })
      return { success: true, likes: updatedPost.likes }
    } catch (error) {
      handleApiError(event, 500, '좋아요 업데이트 실패', error);
    }
  }

  if (method === 'DELETE') {
    const { id } = await readBody(event)
    try {
      await prisma.humorPost.delete({ where: { id: parseInt(id) } })
      return { success: true }
    } catch (error) {
      handleApiError(event, 500, '유머 게시글 삭제 실패', error);
    }
  }

  handleApiError(event, 405, 'Method Not Allowed');
})