import prisma from '~/server/utils/prisma'

/**
 * @file 연락처 (문의) 관리 API
 * @description 사용자 문의 및 답변에 대한 CRUD (생성, 조회, 삭제) 작업을 처리합니다.
 *              개별 문의 조회, 페이지네이션 및 검색/정렬을 통한 목록 조회, 새로운 문의 생성, 답변 생성, 문의 삭제 기능을 제공합니다.
 */
export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  // GET 요청 처리: 문의 목록 조회 또는 특정 문의 조회
  if (method === 'GET') {
    // 쿼리 파라미터에서 ID, 페이지, 페이지당 항목 수, 검색 유형, 검색 텍스트, 정렬 컬럼 및 정렬 순서를 추출합니다.
    const { id, page = 1, itemsPerPage = 10, type, text, sortColumn, sortOrder } = getQuery(event)

    // ID가 제공된 경우 특정 문의를 조회합니다.
    if (id) {
      const contact = await prisma.contact.findUnique({
        where: { id: parseInt(id) }
      })
      // 문의를 찾을 수 없으면 404 Not Found 오류를 반환합니다.
      return contact || createError({
        statusCode: 404,
        statusMessage: '연락처를 찾을 수 없습니다'
      })
    } else {
      // ID가 없는 경우 문의 목록을 페이지네이션 및 검색/정렬하여 조회합니다.
      const skip = (page - 1) * itemsPerPage
      let whereClause = {}

      // 검색 텍스트가 있는 경우 검색 유형(저자, 제목, 내용)에 따라 WHERE 절을 구성합니다.
      if (text) {
        if (type === 'author') {
          whereClause.author = { contains: text, mode: 'insensitive' }
        } else if (type === 'title') {
          whereClause.title = { contains: text, mode: 'insensitive' }
        } else if (type === 'content') {
          whereClause.content = { contains: text, mode: 'insensitive' }
        }
      }

      // 정렬 컬럼과 순서가 제공된 경우 ORDER BY 절을 구성합니다. 기본 정렬은 ID 내림차순입니다.
      let orderBy = {}
      if (sortColumn && sortOrder) {
        orderBy[sortColumn] = sortOrder.toLowerCase()
      } else {
        orderBy = { id: 'desc' } // 기본 정렬: 최신 문의가 먼저 오도록 ID 내림차순 정렬
      }

      // 문의 목록과 총 개수를 병렬로 조회합니다.
      const [posts, totalCount] = await Promise.all([
        prisma.contact.findMany({
          where: whereClause,
          orderBy: orderBy,
          take: parseInt(itemsPerPage),
          skip: skip
        }),
        prisma.contact.count({ where: whereClause }) // 검색 조건에 맞는 전체 문의 개수
      ])

      // 조회된 문의 목록과 페이지네이션 정보를 반환합니다.
      return {
        posts,
        total: totalCount,
        page: parseInt(page),
        itemsPerPage: parseInt(itemsPerPage)
      }
    }
  }

  // POST 요청 처리: 새로운 문의 생성 또는 문의에 대한 답변 생성
  if (method === 'POST') {
    const body = await readBody(event)
    const { author, title, content, email, type, id } = body
    console.log(body) // 요청 본문 로깅 (디버깅용)

    try {
      // 'reply' 타입 요청인 경우, 기존 문의에 대한 답변을 생성합니다.
      if (type === 'reply') {
        // 원본 문의를 조회하여 답변의 제목을 구성합니다.
        const originalPost = await prisma.contact.findUnique({
          where: { id: parseInt(id) }
        })

        if (!originalPost) {
          throw createError({
            statusCode: 404,
            statusMessage: '원본 문의를 찾을 수 없습니다'
          })
        }

        // 로그인한 사용자 정보 가져오기 (관리자 답변 등)
        // NOTE: 실제 구현에서는 JWT 토큰 등을 통해 사용자 정보를 안전하게 가져와야 합니다.
        const loggedInUser = await getLoggedInUser(event)

        // 답변 문의 생성
        const result = await prisma.contact.create({
          data: {
            title: `Re: ${originalPost.title}`, // 원본 문의 제목 앞에 'Re:' 추가
            author: loggedInUser.name,
            email: loggedInUser.email,
            content,
          }
        })

        return { success: true, id: result.id }
      } else {
        // 'reply' 타입이 아닌 경우, 새로운 일반 문의를 생성합니다.
        const result = await prisma.contact.create({
          data: { author, title, content, email }
        })
        return { success: true, id: result.id }
      }
    } catch (error) {
      // 문의 생성 중 오류 발생 시 로깅하고 500 Internal Server Error 반환
      console.error('연락처 생성 중 오류:', error)
      throw createError({
        statusCode: 500,
        statusMessage: '연락처 생성 실패'
      })
    }
  }

  // DELETE 요청 처리: 특정 ID의 문의를 삭제합니다.
  if (method === 'DELETE') {
    const { id } = await readBody(event)
    try {
      // ID를 사용하여 문의 레코드 삭제 (ID는 정수로 변환)
      await prisma.contact.delete({
        where: { id: parseInt(id) }
      })
      return { success: true } // 성공 응답
    } catch (error) {
      // 문의 삭제 중 오류 발생 시 로깅하고 500 Internal Server Error 반환
      console.error('연락처 삭제 중 오류:', error)
      throw createError({
        statusCode: 500,
        statusMessage: '연락처 삭제 실패'
      })
    }
  }

  // 지원하지 않는 HTTP 메소드에 대한 처리: 405 Method Not Allowed 반환
  throw createError({
    statusCode: 405,
    statusMessage: 'Method Not Allowed'
  })
})

/**
 * @function getLoggedInUser
 * @description 현재 로그인된 사용자 정보를 가져오는 더미 함수입니다.
 *              실제 프로덕션 환경에서는 JWT 토큰 검증, 세션 확인 등 보안 로직을 통해
 *              사용자 정보를 안전하게 추출해야 합니다.
 * @param {object} event - Nuxt.js 이벤트 객체
 * @returns {object} 로그인된 사용자의 이름과 이메일 (예시 값)
 */
async function getLoggedInUser(event) {
  // 여기에 실제 로그인한 사용자 정보를 가져오는 로직 구현
  // 예: JWT 토큰 확인, 세션 확인 등
  // 현재는 예시 데이터만 반환합니다.
  return {
    name: '관리자',
    email: 'admin@example.com'
  }
}