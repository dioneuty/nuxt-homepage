import { PrismaClient } from '@prisma/client'
import { defineEventHandler, readBody } from 'h3'

const prisma = new PrismaClient()

// BigInt를 문자열로 변환하는 함수
const bigIntToString = (data) => {
  if (typeof data === 'bigint') {
    return data.toString()
  }
  if (Array.isArray(data)) {
    return data.map(bigIntToString)
  }
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

  if (method === 'GET') {
    const item = await prisma.outlineItem.findUnique({
      where: { id: BigInt(id) }
    })
    if (!item) {
      event.res.statusCode = 404
      return { message: 'Item not found' }
    }
    return bigIntToString(item)
  }

  if (method === 'PUT') {
    const { content } = await readBody(event)
    
    // 기존 항목 조회
    const existingItem = await prisma.outlineItem.findUnique({
      where: { id: BigInt(id) }
    })

    const result = await prisma.outlineItem.upsert({
      where: { id: BigInt(id) },
      update: { content },
      create: {
        id: BigInt(id),
        content,
        order: existingItem ? existingItem.order : 0,
        parentId: existingItem ? existingItem.parentId : null
      }
    })

    return bigIntToString(result)
  }
})
