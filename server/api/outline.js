import { PrismaClient } from '@prisma/client'
import { defineEventHandler, readBody } from 'h3'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = event.req.method
  const { id } = event.context.params || {}

  if (method === 'GET') {
    if (id) {
      return await prisma.outlineItem.findUnique({
        where: { id: parseInt(id) },
        include: { children: true }
      })
    } else {
      return await prisma.outlineItem.findMany({
        where: { parentId: null },
        include: { children: true },
        orderBy: { order: 'asc' }
      })
    }
  }

  if (method === 'POST') {
    const { content, parentId } = await readBody(event)
    
    // 현재 최대 order 값을 조회
    const maxOrder = await prisma.outlineItem.findFirst({
      where: { parentId },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const newOrder = maxOrder ? maxOrder.order + 1n : 1n // BigInt 사용

    return await prisma.outlineItem.create({
      data: { content, parentId, order: newOrder }
    })
  }

  if (method === 'PUT') {
    const { content, order } = await readBody(event)
    return await prisma.outlineItem.update({
      where: { id: parseInt(id) },
      data: { content, order }
    })
  }

  if (method === 'DELETE') {
    return await prisma.outlineItem.delete({
      where: { id: parseInt(id) }
    })
  }
})
