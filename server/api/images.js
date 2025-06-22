import prisma from '~/server/utils/prisma'
import { handleApiError } from '~/server/utils/apiErrorHandlers'

/**
 * @file 이미지 관리 API
 * @description 이미지 데이터 (URL, 대체 텍스트)에 대한 CRUD (생성, 조회, 삭제) 작업을 처리합니다.
 */
export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  // GET 요청 처리: 모든 이미지 목록을 조회합니다.
  if (method === 'GET') {
    try {
      const images = await prisma.image.findMany()
      return images
    } catch (error) {
      // 이미지 조회 중 오류 발생 시 로깅하고 500 Internal Server Error 반환
      handleApiError(event, 500, '이미지 조회 실패', error)
    }
  }

  // POST 요청 처리: 새로운 이미지를 생성합니다.
  if (method === 'POST') {
    const { url, alt } = await readBody(event)
    try {
      // 제공된 URL과 대체 텍스트로 새 이미지 레코드 생성
      const image = await prisma.image.create({
        data: { url, alt }
      })
      return image
    } catch (error) {
      // 이미지 생성 중 오류 발생 시 로깅하고 500 Internal Server Error 반환
      handleApiError(event, 500, '이미지 생성 실패', error)
    }
  }

  // DELETE 요청 처리: 특정 ID의 이미지를 삭제합니다.
  if (method === 'DELETE') {
    const { id } = await readBody(event)
    try {
      // ID를 사용하여 이미지 레코드 삭제 (ID는 정수로 변환)
      await prisma.image.delete({
        where: { id: parseInt(id) }
      })
      return { success: true } // 성공 응답
    } catch (error) {
      // 이미지 삭제 중 오류 발생 시 로깅하고 500 Internal Server Error 반환
      handleApiError(event, 500, '이미지 삭제 실패', error)
    }
  }

  // 지원하지 않는 HTTP 메소드에 대한 처리: 405 Method Not Allowed 반환
  handleApiError(event, 405, 'Method Not Allowed')
})