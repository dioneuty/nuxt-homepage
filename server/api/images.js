import prisma from '~/server/utils/prisma'
import { handleApiError } from '~/server/utils/apiErrorHandlers'

// 이미지 관리 API
export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  if (method === 'GET') {
    try {
      return await prisma.image.findMany()
    } catch (error) {
      handleApiError(event, 500, '이미지 조회 실패', error)
    }
  }

  if (method === 'POST') {
    const { url, alt } = await readBody(event)
    try {
      return await prisma.image.create({ data: { url, alt } })
    } catch (error) {
      handleApiError(event, 500, '이미지 생성 실패', error)
    }
  }

  if (method === 'DELETE') {
    const { id } = await readBody(event)
    try {
      await prisma.image.delete({ where: { id: parseInt(id) } })
      return { success: true }
    } catch (error) {
      handleApiError(event, 500, '이미지 삭제 실패', error)
    }
  }

  handleApiError(event, 405, 'Method Not Allowed')
})