import { PrismaClient } from '@prisma/client'
import * as jose from 'jose'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  const query = getQuery(event)

  // GET 요청 처리 (인증 불필요)
  if (method === 'GET') {
    if (query.id) {
      const id = parseInt(query.id, 10)
      
      if (isNaN(id)) {
        throw createError({
          statusCode: 400,
          message: '유효하지 않은 ID입니다.',
        })
      }

      const wiki = await prisma.wiki.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
        }
      })

      if (!wiki) {
        throw createError({
          statusCode: 404,
          message: '위키 페이지를 찾을 수 없습니다.',
        })
      }

      return wiki
    } else {
      const wikis = await prisma.wiki.findMany({
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
        }
      })
      return wikis
    }
  }

  // PUT, POST, DELETE 요청에 대해서만 토큰 인증 수행
  if (['PUT', 'POST', 'DELETE'].includes(method)) {
    const token = getCookie(event, 'auth_token')
    
    if (!token) {
      throw createError({
        statusCode: 401,
        message: '인증 토큰이 없습니다.',
      })
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      const { payload } = await jose.jwtVerify(token, secret)
      const userId = payload.userId

      // POST 요청 처리 (새 위키 페이지 생성)
      if (method === 'POST') {
        const body = await readBody(event)
        try {
          const newWiki = await prisma.wiki.create({
            data: {
              title: body.title,
              content: body.content,
              author: userId.toString(),
            },
          })
          return newWiki
        } catch (error) {
          console.error('Error creating wiki:', error)
          throw createError({
            statusCode: 500,
            message: '위키 페이지 생성 중 오류가 발생했습니다.',
          })
        }
      }

      // PUT 요청 처리 (위키 페이지 수정)
      if (method === 'PUT') {
        const body = await readBody(event)
        const updatedWiki = await prisma.wiki.update({
          where: { id: parseInt(query.id, 10) },
          data: {
            title: body.title,
            content: body.content,
          },
        })
        return updatedWiki
      }

      // DELETE 요청 처리 (위키 페이지 삭제)
      if (method === 'DELETE') {
        const deletedWiki = await prisma.wiki.delete({
          where: { id: parseInt(query.id, 10) },
        })
        return deletedWiki
      }
    } catch (error) {
      console.error('Token verification error:', error)
      if (error.code === 'ERR_JWT_EXPIRED') {
        throw createError({
          statusCode: 401,
          message: '토큰이 만료되었습니다.',
        })
      }
      throw createError({
        statusCode: 401,
        message: '유효하지 않은 토큰입니다.',
      })
    }
  }

  throw createError({
    statusCode: 405,
    message: '허용되지 않은 메소드입니다.',
  })
})