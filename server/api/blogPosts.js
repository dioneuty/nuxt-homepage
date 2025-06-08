import prisma from '~/server/utils/prisma'

/**
 * @file 블로그 게시물 API
 * @description 블로그 게시물에 대한 CRUD (생성, 조회, 업데이트, 삭제) 작업을 처리합니다.
 *              개별 게시물 조회, 이전/다음 게시물 탐색, 카테고리별 목록 조회 기능을 제공합니다.
 */
export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  const { id, category, type } = getQuery(event)

  // GET 요청 처리: 블로그 게시물 조회 또는 탐색 기능을 제공합니다.
  if (method === 'GET') {
    // 'type' 쿼리 파라미터가 'navigation'인 경우, 특정 게시물의 이전/다음 게시물을 조회합니다.
    if (type === 'navigation') {
      // 게시물 ID가 제공되지 않으면 400 Bad Request 오류를 반환합니다.
      if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'ID가 필요합니다' })
      }

      // 현재 게시물의 ID와 카테고리 ID를 데이터베이스에서 조회합니다.
      const currentPost = await prisma.blogPost.findUnique({
        where: { id: parseInt(id) },
        select: { id: true, categoryId: true }
      })

      // 현재 게시물을 찾을 수 없으면 404 Not Found 오류를 반환합니다.
      if (!currentPost) {
        throw createError({ statusCode: 404, statusMessage: '블로그 포스트를 찾을 수 없습니다' })
      }

      // 이전 게시물과 다음 게시물을 비동기적으로 병렬 조회합니다.
      const [prev, next] = await Promise.all([
        // 이전 게시물 조회: 현재 게시물 ID보다 작고 동일한 카테고리의 게시물 중 가장 최근 게시물
        prisma.blogPost.findFirst({
          where: {
            id: { lt: currentPost.id },
            categoryId: currentPost.categoryId
          },
          orderBy: { id: 'desc' }, // ID 내림차순으로 정렬하여 가장 큰 (가장 최신) ID를 찾습니다.
          select: { id: true, title: true } // ID와 제목만 선택하여 반환합니다.
        }),
        // 다음 게시물 조회: 현재 게시물 ID보다 크고 동일한 카테고리의 게시물 중 가장 오래된 게시물
        prisma.blogPost.findFirst({
          where: {
            id: { gt: currentPost.id },
            categoryId: currentPost.categoryId
          },
          orderBy: { id: 'asc' }, // ID 오름차순으로 정렬하여 가장 작은 (가장 오래된) ID를 찾습니다.
          select: { id: true, title: true } // ID와 제목만 선택하여 반환합니다.
        })
      ])

      // 조회된 이전/다음 게시물 정보를 반환합니다.
      return { prev, next }
    }
    
    // 'id' 쿼리 파라미터가 제공된 경우, 특정 블로그 게시물을 상세 조회합니다.
    if (id) {
      const post = await prisma.blogPost.findUnique({
        where: { id: parseInt(id) },
        include: { category: true } // 게시물과 연결된 카테고리 정보도 함께 포함하여 조회합니다.
      })
      // 게시물을 찾을 수 없으면 404 Not Found 오류를 반환합니다.
      return post || createError({ statusCode: 404, statusMessage: '블로그 포스트를 찾을 수 없습니다' })
    } else {
      // 'id' 쿼리 파라미터가 없는 경우, 블로그 게시물 목록을 조회합니다.
      // 'category' 쿼리 파라미터가 있는 경우 해당 카테고리로 필터링합니다.
      let whereClause = {}
      if (category && category !== '-1') { // '-1'은 '전체' 카테고리를 의미할 수 있습니다.
        const categoryId = parseInt(category)
        if (!isNaN(categoryId)) { // 유효한 숫자 카테고리 ID인지 확인합니다.
          whereClause.categoryId = categoryId
        }
      }

      // 필터링 조건에 따라 블로그 게시물 목록을 ID 내림차순으로 정렬하여 조회합니다.
      const posts = await prisma.blogPost.findMany({
        where: whereClause,
        orderBy: { id: 'desc' }, // 최신 게시물이 먼저 오도록 ID 내림차순 정렬
        include: { category: true } // 게시물과 연결된 카테고리 정보도 함께 포함하여 조회합니다.
      })
      return posts
    }
  }

  // POST 요청 처리: 새로운 블로그 게시물을 생성합니다.
  if (method === 'POST') {
    const { title, content, categoryId } = await readBody(event)
    try {
      const result = await prisma.blogPost.create({
        data: { 
          title, 
          content, 
          categoryId: categoryId ? parseInt(categoryId) : undefined  // 카테고리 ID가 제공되면 연결, 아니면 미지정
        },
        include: { category: true } // 생성된 게시물의 카테고리 정보도 함께 반환합니다.
      })
      return { success: true, post: result }
    } catch (error) {
      // 게시물 생성 중 오류 발생 시 콘솔에 로그를 출력하고 500 Internal Server Error를 반환합니다.
      console.error('블로그 포스트 생성 중 오류:', error)
      throw createError({ statusCode: 500, statusMessage: '블로그 포스트 생성 실패' })
    }
  }

  // PUT 요청 처리: 특정 ID의 블로그 게시물을 업데이트합니다.
  if (method === 'PUT') {
    const { id, title, content, categoryId } = await readBody(event)
    try {
      const updatedPost = await prisma.blogPost.update({
        where: { id: parseInt(id) }, // 업데이트할 게시물의 ID를 지정합니다.
        data: { 
          title, 
          content, 
          categoryId: categoryId ? parseInt(categoryId) : undefined  // 카테고리 ID가 제공되면 업데이트, 아니면 미지정
        },
        include: { category: true } // 업데이트된 게시물의 카테고리 정보도 함께 반환합니다.
      })
      return { success: true, post: updatedPost }
    } catch (error) {
      // 게시물 업데이트 중 오류 발생 시 콘솔에 로그를 출력하고 500 Internal Server Error를 반환합니다.
      console.error('블로그 포스트 업데이트 중 오류:', error)
      throw createError({ statusCode: 500, statusMessage: '블로그 포스트 업데이트 실패' })
    }
  }

  // DELETE 요청 처리: 특정 ID의 블로그 게시물을 삭제합니다.
  if (method === 'DELETE') {
    const { id } = getQuery(event)
    try {
      // 제공된 ID를 사용하여 게시물 레코드를 데이터베이스에서 삭제합니다.
      await prisma.blogPost.delete({
        where: { id: parseInt(id) }
      })
      return { success: true } // 성공적으로 삭제되었음을 반환합니다.
    } catch (error) {
      // 게시물 삭제 중 오류 발생 시 콘솔에 로그를 출력하고 500 Internal Server Error를 반환합니다.
      console.error('블로그 포스트 삭제 중 오류:', error)
      throw createError({ statusCode: 500, statusMessage: '블로그 포스트 삭제 실패' })
    }
  }

  // 지원하지 않는 HTTP 메소드에 대한 처리: 405 Method Not Allowed 오류를 반환합니다.
  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
})