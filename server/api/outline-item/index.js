import { PrismaClient } from '@prisma/client'
import { defineEventHandler, readBody } from 'h3'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = event.req.method

  if (method === 'POST') {
    const { id, content } = await readBody(event)
    return await prisma.outlineItem.create({
      data: { id: parseInt(id), content }
    })
  }
})
