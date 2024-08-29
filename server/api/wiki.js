import { PrismaClient } from '@prisma/client'
import * as jose from 'jose'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)
    console.log(payload)
    // 페이로드에서 사용자 ID를 추출합니다.
    const userId = payload.userId // 또는 payload.sub, 토큰 구조에 따라 다를 수 있습니다.

    const method = event.node.req.method
    const query = getQuery(event)

    // GET 요청 처리
    if (method === 'GET') {
      if (query.id) {
        // query.id를 정수로 변환
        const id = parseInt(query.id, 10)
        
        // id가 유효한 정수인지 확인
        if (isNaN(id)) {
          throw createError({
            statusCode: 400,
            statusMessage: '유효하지 않은 ID입니다.',
          })
        }

        // 특정 위키 페이지 조회
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
            statusMessage: '위키 페이지를 찾을 수 없습니다.',
          })
        }

        return wiki
      } else {
        // 모든 위키 페이지 목록 조회 (변경 없음)
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
          statusMessage: '위키 페이지 생성 중 오류가 발생했습니다.',
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

    throw createError({
      statusCode: 405,
      statusMessage: '허용되지 않은 메소드입니다.',
    })
  } catch (error) {
    console.error('Token verification error:', error)
    throw createError({
      statusCode: 401,
      statusMessage: '유효하지 않은 토큰입니다.',
    })
  }
})