import prisma from '~/server/utils/prisma'
import { defineEventHandler, readBody } from 'h3'
import { handleApiError } from '~/server/utils/apiErrorHandlers'

/**
 * @file 개별 아웃라인 항목 관리 API
 * @description 특정 ID의 아웃라인 항목을 조회하거나 업데이트 (생성 또는 수정)하는 기능을 제공합니다.
 *              BigInt 타입 데이터를 문자열로 변환하는 유틸리티 함수를 포함합니다.
 */

/**
 * @function bigIntToString
 * @description Prisma에서 반환될 수 있는 BigInt 타입의 값을 JavaScript에서 안전하게 처리하기 위해 문자열로 변환합니다.
 *              객체나 배열 내의 모든 BigInt 값에 대해 재귀적으로 변환을 수행합니다.
 * @param {any} data - BigInt를 포함할 수 있는 데이터 (단일 값, 배열, 객체 등)
 * @returns {any} BigInt가 문자열로 변환된 데이터
 */
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
  // URL 파라미터에서 항목 ID를 추출합니다.
  const { id } = event.context.params

  try {
    // GET 요청 처리: 특정 아웃라인 항목을 ID로 조회합니다.
    if (method === 'GET') {
      // Prisma를 사용하여 ID에 해당하는 아웃라인 항목을 조회합니다. ID는 문자열로 유지합니다.
      const item = await prisma.outlineItem.findUnique({
        where: { id: id }
      })
      // 항목을 찾을 수 없으면 404 Not Found 오류를 반환합니다.
      if (!item) {
        return handleApiError(event, 404, '아웃라인 항목을 찾을 수 없습니다')
      }
      // 조회된 항목의 BigInt 필드를 문자열로 변환하여 반환합니다.
      return bigIntToString(item)
    }

    // PUT 요청 처리: 특정 아웃라인 항목의 내용을 업데이트합니다. (ID가 없으면 생성)
    // 이 API는 PUT 요청을 통해 기존 항목을 수정하거나, 해당 ID의 항목이 없을 경우 새로 생성하는 'upsert' 로직을 사용합니다.
    if (method === 'PUT') {
      // 요청 본문에서 업데이트할 'content'를 추출합니다.
      const { content } = await readBody(event)
      
      // 기존 항목 조회 (upsert의 create 부분에서 사용될 수 있는 order 및 parentId를 가져오기 위함)
      const existingItem = await prisma.outlineItem.findUnique({
        where: { id: id }
      })

      // Prisma의 upsert 기능을 사용하여 항목을 업데이트하거나 생성합니다.
      // where: 주어진 ID로 항목을 찾습니다.
      // update: 항목이 발견되면 'content'를 업데이트합니다.
      // create: 항목이 발견되지 않으면 새로운 항목을 생성합니다. 이때 기존 항목의 order 및 parentId를 사용하거나 기본값 0/null을 설정합니다.
      const result = await prisma.outlineItem.upsert({
        where: { id: id },
        update: { content },
        create: {
          id: id,
          content,
          order: existingItem ? existingItem.order : 0,
          parentId: existingItem ? existingItem.parentId : null
        }
      })

      // 업데이트되거나 생성된 항목의 BigInt 필드를 문자열로 변환하여 반환합니다.
      return bigIntToString(result)
    }
    
    // 지원하지 않는 HTTP 메소드에 대한 처리: 405 Method Not Allowed 반환 (선택적)
    handleApiError(event, 405, '허용되지 않은 메소드입니다.');

  } catch (error) {
    handleApiError(event, 500, '아웃라인 항목 처리 중 오류 발생', error);
  }
})
