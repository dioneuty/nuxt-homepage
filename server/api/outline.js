import { PrismaClient } from '@prisma/client'
import { defineEventHandler, readBody } from 'h3'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = event.req.method
  const { id } = event.context.params || {}

  if (method === 'GET') {
    const latestState = await prisma.outlineState.findFirst({
      orderBy: { updatedAt: 'desc' }
    })
    return latestState ? latestState.state : null
  }

  if (method === 'POST') {
    const data = await readBody(event)
    await prisma.outlineState.create({
      data: { state: data }
    })
    return { success: true }
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
