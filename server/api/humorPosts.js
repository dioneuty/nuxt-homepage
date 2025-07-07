import prisma from '~/server/utils/prisma'
import { handleApiError } from '~/server/utils/apiErrorHandlers'
import { executePaginatedQuery } from '~/server/utils/pagination'

/**
 * @file 유머 게시판 API
 * @description 유머 게시판 게시물에 대한 CRUD (생성, 조회, 업데이트, 삭제) 작업을 처리합니다.
 *              개별 게시물 조회, 페이지네이션을 통한 목록 조회, 새로운 게시물 생성, 게시물 좋아요 증가, 게시물 삭제 기능을 제공합니다.
 */
export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  // GET 요청 처리: 유머 게시물 목록을 조회하거나 특정 유머 게시물을 상세 조회합니다.
  if (method === 'GET') {
    // 쿼리 파라미터에서 'id' (특정 게시물 조회), 'page' (페이지 번호), 'limit' (페이지당 항목 수)를 추출합니다.
    const { id, page = 1, limit = 10 } = getQuery(event)
    
    // 'id'가 제공된 경우, 특정 유머 게시물을 데이터베이스에서 조회합니다.
    if (id) {
      const post = await prisma.humorPost.findUnique({
        where: { id: parseInt(id) } // 제공된 ID로 게시물을 찾습니다.
      })
      // 게시물을 찾을 수 없으면 404 Not Found 오류를 반환합니다.
      if (!post) {
        handleApiError(event, 404, '유머 게시글을 찾을 수 없습니다')
      }
      return post;
    } else {
      // 'id'가 없는 경우, 유머 게시물 목록을 페이지네이션하여 조회합니다.
      // 새로운 페이지네이션 유틸리티를 사용하여 코드 중복을 제거합니다.
      return await executePaginatedQuery(prisma.humorPost, {
        where: {}, // 유머 게시판은 특별한 필터링 조건이 없습니다.
        orderBy: { createdAt: 'desc' }, // 최신 게시물이 먼저 오도록 생성일 내림차순으로 정렬합니다.
        page,
        limit
      })
    }
  }

  // POST 요청 처리: 새로운 유머 게시물을 생성합니다.
  if (method === 'POST') {
    const { title, content, author } = await readBody(event) // 요청 본문에서 제목, 내용, 작성자를 읽어옵니다.
    try {
      const result = await prisma.humorPost.create({
        data: { title, content, author } // 제공된 데이터로 새로운 게시물을 생성합니다.
      })
      return { success: true, id: result.id } // 성공 응답과 생성된 게시물의 ID를 반환합니다.
    } catch (error) {
      // 게시물 생성 중 오류 발생 시 콘솔에 로그를 출력하고 500 Internal Server Error를 반환합니다.
      handleApiError(event, 500, '유머 게시글 생성 실패', error);
    }
  }

  // PUT 요청 처리: 특정 ID의 유머 게시물에 대한 좋아요 수를 증가시킵니다.
  if (method === 'PUT') {
    const { id } = await readBody(event) // 요청 본문에서 게시물 ID를 읽어옵니다.
    try {
      // 제공된 ID를 사용하여 게시물 레코드의 'likes' 필드를 1 증가시킵니다.
      const updatedPost = await prisma.humorPost.update({
        where: { id: parseInt(id) }, // 업데이트할 게시물의 ID를 지정합니다.
        data: { likes: { increment: 1 } } // 'likes' 필드를 1 증가시킵니다.
      })
      return { success: true, likes: updatedPost.likes } // 성공 응답과 업데이트된 좋아요 수를 반환합니다.
    } catch (error) {
      // 좋아요 업데이트 중 오류 발생 시 콘솔에 로그를 출력하고 500 Internal Server Error를 반환합니다.
      handleApiError(event, 500, '좋아요 업데이트 실패', error);
    }
  }

  // DELETE 요청 처리: 특정 ID의 유머 게시물을 삭제합니다.
  if (method === 'DELETE') {
    const { id } = await readBody(event) // 요청 본문에서 게시물 ID를 읽어옵니다.
    try {
      // 제공된 ID를 사용하여 게시물 레코드를 데이터베이스에서 삭제합니다.
      await prisma.humorPost.delete({
        where: { id: parseInt(id) } // 삭제할 게시물의 ID를 지정합니다.
      })
      return { success: true } // 성공적으로 삭제되었음을 반환합니다。
    } catch (error) {
      // 게시물 삭제 중 오류 발생 시 콘솔에 로그를 출력하고 500 Internal Server Error를 반환합니다.
      handleApiError(event, 500, '유머 게시글 삭제 실패', error);
    }
  }

  // 지원하지 않는 HTTP 메소드에 대한 처리: 405 Method Not Allowed 오류를 반환합니다.
  throw handleApiError(405, 'Method Not Allowed');
})