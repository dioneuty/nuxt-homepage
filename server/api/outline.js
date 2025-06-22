import prisma from '~/server/utils/prisma'
import { defineEventHandler, readBody } from 'h3'
import { handleApiError } from '~/server/utils/apiErrorHandlers'

/**
 * @file 아웃라인 상태 관리 API
 * @description 사용자가 편집하는 아웃라인(개요)의 현재 상태를 저장하고 불러오는 기능을 제공합니다.
 *              최신 아웃라인 상태를 조회하거나 새로운 상태를 저장할 수 있습니다.
 */
export default defineEventHandler(async (event) => {
  const method = event.req.method

  // GET 요청 처리: 데이터베이스에서 가장 최신 아웃라인 상태를 조회하여 반환합니다.
  if (method === 'GET') {
    try {
      // Prisma를 사용하여 'outlineState' 테이블에서 'updatedAt' 필드를 기준으로 최신 상태를 내림차순으로 정렬하여 첫 번째 레코드를 찾습니다.
      const latestState = await prisma.outlineState.findFirst({
        orderBy: { updatedAt: 'desc' } // 가장 최근에 업데이트된 아웃라인 상태를 가져오기 위해 내림차순 정렬
      })
      // 최신 상태가 존재하면 해당 상태의 'state' 데이터를 반환하고, 없으면 'null'을 반환합니다.
      return latestState ? latestState.state : null
    } catch (error) {
      handleApiError(error, '아웃라인 상태 조회 중 오류', 500);
    }
  }

  // POST 요청 처리: 새로운 아웃라인 상태를 데이터베이스에 저장합니다.
  if (method === 'POST') {
    try {
      // 요청 본문에서 JSON 형식의 아웃라인 상태 데이터를 읽어옵니다.
      const data = await readBody(event)
      // 읽어온 상태 데이터를 Prisma를 사용하여 'outlineState' 테이블에 새 레코드로 생성합니다.
      await prisma.outlineState.create({
        data: { state: data } // 'state' 필드에 전송된 JSON 데이터를 저장합니다.
      })
      return { success: true } // 상태 저장이 성공했음을 나타내는 응답을 반환합니다.
    } catch (error) {
      handleApiError(error, '아웃라인 상태 저장 중 오류', 500);
    }
  }

  // 지원하지 않는 HTTP 메소드에 대한 처리: 405 Method Not Allowed 오류를 반환합니다.
  throw handleApiError(405, 'Method Not Allowed');
})
