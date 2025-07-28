import prisma from '~/server/utils/prisma'
import { defineEventHandler, readBody } from 'h3'
import { handleApiError } from '~/server/utils/apiErrorHandlers'

// 아웃라인 상태 관리 API
export default defineEventHandler(async (event) => {
  const method = event.req.method

  if (method === 'GET') {
    try {
      const latestState = await prisma.outlineState.findFirst({
        orderBy: { updatedAt: 'desc' }
      })
      return latestState?.state || null
    } catch (error) {
      handleApiError(event, 500, '아웃라인 상태 조회 중 오류', error);
    }
  }

  if (method === 'POST') {
    try {
      const data = await readBody(event)
      await prisma.outlineState.create({
        data: {
          state: data,
          updatedAt: new Date(), // updatedAt 필드 추가
        }
      })
      return { success: true }
    } catch (error) {
      handleApiError(event, 500, '아웃라인 상태 저장 중 오류', error);
    }
  }

  handleApiError(event, 405, 'Method Not Allowed');
})
