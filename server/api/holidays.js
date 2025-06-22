import prisma from '~/server/utils/prisma'
import { handleApiError } from '~/server/utils/apiErrorHandlers'

/**
 * @file 공휴일 조회 API
 * @description 특정 년도와 월에 해당하는 공휴일 정보를 데이터베이스에서 조회하여 반환합니다.
 */
export default defineEventHandler(async (event) => {
  console.log('holidays api called') // API 호출 로그
  
  try {
    // 쿼리 파라미터에서 년도와 월을 추출합니다.
    // 'year'와 'month'는 정수로 변환됩니다.
    const { year, month } = getQuery(event)
    
    // 필수 파라미터 검증
    if (!year || !month) {
      return handleApiError(event, 400, '년도와 월을 입력해야 합니다.')
    }

    // Prisma를 사용하여 데이터베이스에서 해당 년도와 월의 공휴일을 조회합니다.
    const holidays = await prisma.holiday.findMany({
      where: {
        year: parseInt(year),
        month: parseInt(month)
      }
    })
    
    // 조회된 공휴일 목록을 반환합니다.
    return holidays
  } catch (error) {
    handleApiError(event, 500, '공휴일 조회 실패', error)
  }
})