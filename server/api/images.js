import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  // GET 요청 처리
  if (method === 'GET') {
    try {
      const images = await prisma.image.findMany()
      return images
    } catch (error) {
      console.error('이미지 조회 중 오류:', error)
      throw createError({
        statusCode: 500,
        statusMessage: '이미지 조회 실패'
      })
    }
  }

  // POST 요청 처리
  if (method === 'POST') {
    const { url, alt } = await readBody(event)
    try {
      const image = await prisma.image.create({
        data: { url, alt }
      })
      return image
    } catch (error) {
      console.error('이미지 생성 중 오류:', error)
      throw createError({
        statusCode: 500,
        statusMessage: '이미지 생성 실패'
      })
    }
  }

  // DELETE 요청 처리
  if (method === 'DELETE') {
    const { id } = await readBody(event)
    try {
      await prisma.image.delete({
        where: { id: parseInt(id) }
      })
      return { success: true }
    } catch (error) {
      console.error('이미지 삭제 중 오류:', error)
      throw createError({
        statusCode: 500,
        statusMessage: '이미지 삭제 실패'
      })
    }
  }

  // 지원하지 않는 메소드에 대한 처리
  throw createError({
    statusCode: 405,
    statusMessage: 'Method Not Allowed'
  })
})