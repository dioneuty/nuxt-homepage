import prisma from '~/server/utils/prisma'
import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const method = event.req.method

  if (method === 'POST') {
    const { id, content } = await readBody(event)
    return await prisma.outlineItem.create({
      data: { id: parseInt(id), content }
    })
  }
})
