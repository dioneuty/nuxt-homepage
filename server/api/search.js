import { defineEventHandler, readBody } from 'h3'
import { handleApiError } from '~/server/utils/apiErrorHandlers'
import { searchAllContent } from '~/server/utils/searchUtils'

/**
 * @file 통합 검색 API
 * @description 웹사이트의 다양한 콘텐츠에서 검색어에 해당하는 내용을 찾아 반환합니다.
 */
export default defineEventHandler(async (event) => {
  const { query } = await readBody(event)

  try {
    const results = await searchAllContent(query)
    return results
  } catch (error) {
    handleApiError(event, 500, '통합 검색 중 오류가 발생했습니다.', error);
  }
})