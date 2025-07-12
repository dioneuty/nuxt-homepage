import prisma from '~/server/utils/prisma'
import { defineEventHandler, readBody } from 'h3'
import { handleApiError } from '~/server/utils/apiErrorHandlers'

// BigInt를 문자열로 변환하는 유틸리티 함수
const bigIntToString = (data) => {
  if (typeof data === 'bigint') return data.toString()
  if (Array.isArray(data)) return data.map(bigIntToString)
  if (typeof data === 'object' && data !== null) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, bigIntToString(value)])
    )
  }
  return data
}

export default defineEventHandler(async (event) => {
  const method = event.req.method
  const { id } = event.context.params

  try {
    if (!id || typeof id !== 'string') {
      handleApiError(event, 400, '유효하지 않은 아이템 ID입니다');
      return;
    }

    if (method === 'GET') {
      const item = await prisma.outlineItem.findUnique({ where: { id } })
      
      if (!item) {
        handleApiError(event, 404, '아웃라인 항목을 찾을 수 없습니다');
        return;
      }

      return bigIntToString(item)
    }

    if (method === 'PUT') {
      const { content } = await readBody(event)
      
      const existingItem = await prisma.outlineItem.findUnique({ where: { id } })

      const result = await prisma.outlineItem.upsert({
        where: { id },
        update: { content },
        create: {
          id,
          content,
          order: existingItem?.order || 0,
          parentId: existingItem?.parentId || null
        }
      })

      return bigIntToString(result)
    }
    
    handleApiError(event, 405, '허용되지 않은 메소드입니다.');
  } catch (error) {
    handleApiError(event, 500, '아웃라인 항목 처리 중 오류 발생', error);
  }
})
