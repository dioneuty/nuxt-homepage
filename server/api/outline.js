import prisma from '~/server/utils/prisma'
import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const method = event.req.method

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
})
