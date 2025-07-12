import prisma from '~/server/utils/prisma'
import { defineEventHandler, readBody } from 'h3'
import { handleApiError } from '~/server/utils/apiErrorHandlers'

// 아웃라인 항목 생성 API
export default defineEventHandler(async (event) => {
  const method = event.req.method

  if (method === 'POST') {
    const { id, content } = await readBody(event)

    if (!id || !content) {
      handleApiError(event, 400, 'ID와 내용은 필수 입력 사항입니다.');
      return;
    }
    
    return await prisma.outlineItem.create({ data: { id: parseInt(id), content } })
  }
  
  handleApiError(event, 405, 'Method Not Allowed');
})
