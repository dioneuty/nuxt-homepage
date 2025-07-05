import prisma from '~/server/utils/prisma'
import { defineEventHandler, readBody } from 'h3'
import { handleApiError } from '~/server/utils/apiErrorHandlers'

/**
 * @file 아웃라인 항목 생성 API
 * @description 새로운 아웃라인 항목을 생성합니다. 아웃라인 항목은 ID와 콘텐츠를 포함합니다.
 *              이 API는 주로 아웃라인 편집기에서 새 항목을 추가할 때 사용됩니다.
 */
export default defineEventHandler(async (event) => {
  const method = event.req.method

  try {
    // POST 요청 처리: 새로운 아웃라인 항목을 생성합니다.
    if (method === 'POST') {
      // 요청 본문에서 'id'와 'content'를 추출합니다.
      const { id, content } = await readBody(event)

      if (!id || !content) {
        handleApiError(event, 400, 'ID와 내용은 필수 입력 사항입니다.');
        return;
      }
      
      // Prisma를 사용하여 새로운 아웃라인 항목 레코드를 생성합니다.
      // 'id'는 정수로 변환되어 저장됩니다.
      return await prisma.outlineItem.create({
        data: { id: parseInt(id), content } // 생성된 항목을 반환
      })
    }
    
    // 지원하지 않는 HTTP 메소드에 대한 명시적인 오류 처리
    handleApiError(event, 405, 'Method Not Allowed');

  } catch (error) {
    handleApiError(event, 500, '아웃라인 항목 처리 중 오류 발생', error);
  }
})
