import prisma from '~/server/utils/prisma'

/**
 * 방명록 목록을 조회하는 핸들러입니다.
 * HTTP GET 요청을 처리하며, 페이지네이션 기능을 지원합니다.
 *
 * @param {object} event - Nuxt.js 이벤트 객체. 요청 쿼리 파라미터를 포함합니다.
 * @returns {object} 조회된 방명록 게시물, 총 개수, 총 페이지 수를 포함하는 객체.
 * @throws {Error} 방명록 조회 중 오류가 발생하면 500 상태 코드와 오류 메시지를 반환합니다.
 */
export default defineEventHandler(async (event) => {
  // 요청 쿼리 파라미터에서 'page'와 'limit' 값을 가져옵니다.
  // 기본값은 각각 1과 10입니다.
  const { page = 1, limit = 10 } = getQuery(event)

  // 페이지네이션을 위해 건너뛸(skip) 레코드 수를 계산합니다.
  // 'limit'은 문자열로 넘어올 수 있으므로 Number()를 사용하여 숫자로 변환합니다.
  const skip = (Number(page) - 1) * Number(limit)

  try {
    // Promise.all을 사용하여 두 가지 데이터베이스 쿼리를 동시에 실행합니다.
    // 1. 방명록 게시물 목록 조회
    // 2. 전체 방명록 게시물 개수 조회 (페이지네이션을 위함)
    const [posts, totalCount] = await Promise.all([
      prisma.guestbook.findMany({
        // 'skip'을 사용하여 지정된 수의 레코드를 건너뜁니다.
        skip,
        // 'take'를 사용하여 지정된 수의 레코드(페이지당 개수)를 가져옵니다.
        take: Number(limit),
        // 'createdAt' 필드를 기준으로 최신순으로 정렬합니다.
        orderBy: {
          createdAt: 'desc'
        },
        // 각 방명록 게시물에 연결된 댓글들을 함께 포함하여 조회합니다.
        include: {
          comments: {
            // 댓글은 'createdAt' 필드를 기준으로 오래된순으로 정렬합니다.
            orderBy: {
              createdAt: 'asc'
            }
          }
        }
      }),
      // 'guestbook' 테이블의 전체 레코드 개수를 세어 반환합니다.
      prisma.guestbook.count()
    ])

    // 클라이언트에게 반환할 데이터를 구성합니다.
    return {
      posts, // 조회된 방명록 게시물 배열
      totalCount, // 전체 방명록 게시물 개수
      // 총 페이지 수를 계산합니다. 전체 개수를 페이지당 개수로 나누고 올림합니다.
      totalPages: Math.ceil(totalCount / Number(limit))
    }
  } catch (error) {
    // 데이터베이스 조회 중 오류가 발생하면 콘솔에 로그를 기록합니다.
    console.error('방명록 조회 중 오류:', error)
    // 클라이언트에게 오류 응답을 반환합니다.
    throw createError({
      statusCode: 500, // HTTP 상태 코드 500 (Internal Server Error)
      message: '방명록을 불러오는데 실패했습니다.' // 사용자에게 표시될 오류 메시지
    })
  }
})
