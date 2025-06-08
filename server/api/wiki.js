import prisma from '~/server/utils/prisma'
import * as jose from 'jose'

/**
 * @file 위키 페이지 관리 API
 * @description 위키 페이지에 대한 CRUD (생성, 조회, 업데이트, 삭제) 작업을 처리합니다.
 *              GET 요청은 인증 없이 가능하며, POST, PUT, DELETE 요청은 JWT 토큰을 통한 인증이 필요합니다.
 */
export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  const query = getQuery(event)

  // GET 요청 처리: 위키 페이지 조회 (인증 불필요)
  if (method === 'GET') {
    // ID가 쿼리 파라미터로 제공된 경우 특정 위키 페이지를 조회합니다.
    if (query.id) {
      const id = parseInt(query.id, 10)
      
      // 유효하지 않은 ID인 경우 400 Bad Request 오류를 반환합니다.
      if (isNaN(id)) {
        throw createError({
          statusCode: 400,
          message: '유효하지 않은 ID입니다.',
        })
      }

      // Prisma를 사용하여 ID에 해당하는 위키 페이지를 조회합니다.
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

      // 위키 페이지를 찾을 수 없으면 404 Not Found 오류를 반환합니다.
      if (!wiki) {
        throw createError({
          statusCode: 404,
          message: '위키 페이지를 찾을 수 없습니다.',
        })
      }

      // 조회된 위키 페이지 정보를 반환합니다.
      return wiki
    } else {
      // ID가 없는 경우 모든 위키 페이지 목록을 조회합니다.
      const wikis = await prisma.wiki.findMany({
        orderBy: { updatedAt: 'desc' }, // 최신 업데이트된 위키가 먼저 오도록 정렬
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

  // PUT, POST, DELETE 요청에 대해서만 토큰 인증을 수행합니다.
  if (['PUT', 'POST', 'DELETE'].includes(method)) {
    const token = getCookie(event, 'auth_token')
    
    // 인증 토큰이 없는 경우 401 Unauthorized 오류를 반환합니다.
    if (!token) {
      throw createError({
        statusCode: 401,
        message: '인증 토큰이 없습니다.',
      })
    }

    try {
      // JWT Secret을 사용하여 토큰을 검증하고 페이로드를 추출합니다.
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      const { payload } = await jose.jwtVerify(token, secret)
      const userId = payload.userId

      // POST 요청 처리: 새 위키 페이지를 생성합니다.
      if (method === 'POST') {
        const body = await readBody(event)
        try {
          const newWiki = await prisma.wiki.create({
            data: {
              title: body.title,
              content: body.content,
              author: userId.toString(), // 토큰에서 추출한 userId를 작성자로 설정
            },
          })
          return newWiki
        } catch (error) {
          // 위키 생성 중 오류 발생 시 로깅하고 500 Internal Server Error 반환
          console.error('Error creating wiki:', error)
          throw createError({
            statusCode: 500,
            message: '위키 페이지 생성 중 오류가 발생했습니다.',
          })
        }
      }

      // PUT 요청 처리: 특정 ID의 위키 페이지를 수정합니다.
      if (method === 'PUT') {
        const body = await readBody(event)
        // ID를 사용하여 위키 레코드 업데이트 (ID는 정수로 변환)
        const updatedWiki = await prisma.wiki.update({
          where: { id: parseInt(query.id, 10) },
          data: {
            title: body.title,
            content: body.content,
          },
        })
        return updatedWiki
      }

      // DELETE 요청 처리: 특정 ID의 위키 페이지를 삭제합니다.
      if (method === 'DELETE') {
        // ID를 사용하여 위키 레코드 삭제 (ID는 정수로 변환)
        const deletedWiki = await prisma.wiki.delete({
          where: { id: parseInt(query.id, 10) },
        })
        return deletedWiki
      }
    } catch (error) {
      // 토큰 검증 실패 시 오류 로깅 및 상세 오류 메시지 반환
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

  // 지원하지 않는 HTTP 메소드에 대한 처리: 405 Method Not Allowed 반환
  throw createError({
    statusCode: 405,
    message: '허용되지 않은 메소드입니다.',
  })
})