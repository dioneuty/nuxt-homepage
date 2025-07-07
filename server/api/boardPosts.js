import prisma from '~/server/utils/prisma'
import { handleApiError } from '~/server/utils/apiErrorHandlers'
import { executePaginatedQuery } from '~/server/utils/pagination'
import { buildBoardSpecificWhere, buildOrderBy } from '~/server/utils/queryBuilder'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  // GET 요청 처리
  if (method === 'GET') {
    const { id, page = 1, itemsPerPage = 10, type, text, sortColumn, sortOrder } = getQuery(event)
    try {
      if (id && id !== '-1') {
        if (type === 'navigation') {
          // 이전 글과 다음 글 조회
          const currentPost = await prisma.boardPost.findUnique({
            where: { id: parseInt(id) },
            select: { createdAt: true }
          })

          if (!currentPost) {
            throw createError({
              statusCode: 404,
              statusMessage: '게시글을 찾을 수 없습니다'
            })
          }

          const [prevPost, nextPost] = await Promise.all([
            prisma.boardPost.findFirst({
              where: { createdAt: { lt: currentPost.createdAt } },
              orderBy: { createdAt: 'desc' },
              select: { id: true, title: true }
            }),
            prisma.boardPost.findFirst({
              where: { createdAt: { gt: currentPost.createdAt } },
              orderBy: { createdAt: 'asc' },
              select: { id: true, title: true }
            })
          ])

          return { prev: prevPost, next: nextPost }
        } else {
          // 기존 단일 게시글 조회 로직
          const post = await prisma.boardPost.findUnique({
            where: { id: parseInt(id) },
            include: {
              replies: {
                orderBy: {
                  createdAt: 'asc'
                }
              }
            }
          })
          if (post) {
            return post
          } else {
            throw createError({
              statusCode: 404,
              statusMessage: '게시글을 찾을 수 없습니다'
            })
          }
        }
      } else {
        // 기존 게시글 목록 조회 로직 - 새로운 유틸리티 사용
        const searchParams = { type, text }
        const orderBy = buildOrderBy(sortColumn, sortOrder, { id: 'desc' }) // 기본 정렬

        // 자유게시판은 parentId가 null인 것만 조회 (답글 제외)
        const result = await executePaginatedQuery(prisma.boardPost, {
          where: buildBoardSpecificWhere('freeboard', searchParams),
          orderBy,
          page,
          limit: itemsPerPage
        })

        const parentPosts = result.posts
        const totalCount = result.total

        const parentIds = parentPosts.map(p => p.id)
        
        const replies = await prisma.boardPost.findMany({
          where: {
            parentId: { in: parentIds }
          },
          include: {
            parent: {
              select: { title: true }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        })

        const repliesByParentId = replies.reduce((acc, reply) => {
          if (!acc[reply.parentId]) {
            acc[reply.parentId] = []
          }
          acc[reply.parentId].push({
            ...reply,
            title: `${reply.parent.title}의 답변 글입니다`
          })
          return acc
        }, {})

        const posts = []
        parentPosts.forEach(p => {
          posts.push(p)
          if (repliesByParentId[p.id]) {
            posts.push(...repliesByParentId[p.id])
          }
        })

        return {
          posts,
          total: totalCount,
          page: parseInt(page),
          itemsPerPage: parseInt(itemsPerPage)
        }
      }
    } catch (error) {
      handleApiError(event, error, '게시글 조회 중 오류')
    }
  }

  // POST 요청 처리
  if (method === 'POST') {
    const { title, author, content, parentId } = await readBody(event)
    try {
      if (!parentId && !title) {
        throw createError({
          statusCode: 400,
          statusMessage: '새 게시물에는 제목이 필요합니다.'
        })
      }
      const result = await prisma.boardPost.create({
        data: {
          title,
          author,
          content,
          parentId: parentId ? parseInt(parentId) : null
        }
      })
      return { success: true, id: result.id }
    } catch (error) {
      handleApiError(event, error, '게시글 생성 중 오류')
    }
  }

  // PUT 요청 처리
  if (method === 'PUT') {
    const { title, content, id, author } = await readBody(event)
    try {
      await prisma.boardPost.update({
        where: { id: parseInt(id) },
        data: { title, content, author }
      })
      return { success: true }
    } catch (error) {
      handleApiError(event, error, '게시글 업데이트 중 오류')
    }
  }

  // DELETE 요청 처리
  if (method === 'DELETE') {
    const { id } = await readBody(event)
    try {
      await prisma.boardPost.delete({
        where: { id: parseInt(id) }
      })
      return { success: true }
    } catch (error) {
      handleApiError(event, error, '게시글 삭제 중 오류')
    }
  }

  // 지원하지 않는 메소드에 대한 처리
  throw createError({
    statusCode: 405,
    statusMessage: 'Method Not Allowed'
  })
})