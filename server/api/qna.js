import prisma from '~/server/utils/prisma'
import { handleApiError } from '~/server/utils/apiErrorHandlers'
import { executePaginatedQuery } from '~/server/utils/pagination'
import { buildBoardSpecificWhere, buildOrderBy } from '~/server/utils/queryBuilder'

/**
 * @file QnA (질문과 답변) API
 * @description 질문과 답변 게시물에 대한 CRUD (생성, 조회, 업데이트, 삭제) 작업을 처리합니다.
 *              개별 QnA 조회, 페이지네이션 및 검색 기능을 통한 목록 조회, 새로운 질문 생성, 답변 추가, QnA 삭제 기능을 제공합니다.
 */
export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  // GET 요청 처리: QnA 목록 조회 또는 특정 QnA 조회
  if (method === 'GET') {
    // 쿼리 파라미터에서 ID, 페이지, 페이지당 항목 수, 검색 유형, 검색 텍스트를 추출합니다.
    const { id, page = 1, itemsPerPage = 10, type, text } = getQuery(event)
    
    // ID가 제공된 경우 특정 QnA를 조회합니다.
    if (id) {
      const qna = await prisma.qnA.findUnique({
        where: { id: parseInt(id) }
      })
      // QnA를 찾을 수 없으면 404 Not Found 오류를 반환합니다.
      if (!qna) {
        handleApiError(event, 404, 'QnA를 찾을 수 없습니다')
      }
      return qna;
          } else {
        // ID가 없는 경우 QnA 목록을 페이지네이션 및 검색하여 조회합니다.
        // 새로운 검색 및 페이지네이션 유틸리티를 사용하여 코드 중복을 제거합니다.
        const searchParams = { type, text }
        const whereClause = buildBoardSpecificWhere('qna', searchParams)
        const orderBy = buildOrderBy(null, null, { id: 'desc' }) // 기본 정렬: 최신 질문이 먼저

        const result = await executePaginatedQuery(prisma.qnA, {
          where: whereClause,
          orderBy,
          page,
          limit: itemsPerPage
        })

        // QnA 특화 응답 형식으로 변환 (기존 API와 호환성 유지)
        return {
          qnas: result.posts, // posts를 qnas로 변경
          total: result.total,
          page: result.page,
          itemsPerPage: result.itemsPerPage
        }
      }
  }

  // POST 요청 처리: 새로운 QnA 질문을 생성합니다.
  if (method === 'POST') {
    const { questionTitle, questionContent, author } = await readBody(event)
    try {
      const result = await prisma.qnA.create({
        data: { questionTitle, questionContent, author }
      })
      return { success: true, id: result.id }
    } catch (error) {
      // QnA 생성 중 오류 발생 시 로깅하고 500 Internal Server Error 반환
      handleApiError(event, 500, 'QnA 생성 실패', error)
    }
  }

  // PUT 요청 처리: 특정 ID의 QnA 질문 또는 답변을 업데이트합니다.
  if (method === 'PUT') {
    const { id, questionTitle, questionContent, answerContent, answerer } = await readBody(event)
    try {
      // ID를 사용하여 QnA 레코드 업데이트 (ID는 정수로 변환)
      await prisma.qnA.update({
        where: { id: parseInt(id) },
        data: { questionTitle, questionContent, answerContent, answerer }
      })
      return { success: true } // 성공 응답
    } catch (error) {
      // QnA 업데이트 중 오류 발생 시 로깅하고 500 Internal Server Error 반환
      handleApiError(event, 500, 'QnA 업데이트 실패', error)
    }
  }

  // DELETE 요청 처리: 특정 ID의 QnA를 삭제합니다.
  if (method === 'DELETE') {
    const { id } = await readBody(event)
    try {
      // ID를 사용하여 QnA 레코드 삭제 (ID는 정수로 변환)
      await prisma.qnA.delete({
        where: { id: parseInt(id) }
      })
      return { success: true } // 성공 응답
    } catch (error) {
      // QnA 삭제 중 오류 발생 시 로깅하고 500 Internal Server Error 반환
      handleApiError(event, 500, 'QnA 삭제 실패', error)
    }
  }

  // 지원하지 않는 HTTP 메소드에 대한 처리: 405 Method Not Allowed 반환
  handleApiError(event, 405, 'Method Not Allowed')
})