import { defineEventHandler } from 'h3'
import fetch from 'node-fetch'


 /**
 * 카테고리 관련 API
 * fetch 라이브러리를 사용하여 카테고리 관련 API를 호출합니다.
 * 
 * @param {object} event - 이벤트 객체
 * @returns {Promise<object>} - 카테고리 관련 API 응답 객체
 * 
 * 이 함수는 카테고리 관련 API를 호출하여 카테고리 정보를 가져오거나 새 카테고리를 추가하는 기능을 수행합니다.
 * 
 * GET 요청의 경우:
 * - 요청 URL에서 쿼리 문자열을 추출하여 특정 카테고리 ID를 가져옵니다.
 * - 'include' 쿼리 매개변수를 확인하여 'uncategorized' 또는 'uncategorized_all'을 포함한 요청을 처리합니다.
 * - 최종 URL을 구성한 후 fetch를 사용하여 카테고리 정보를 요청합니다.
 * 
 * POST 요청의 경우:
 * - 요청 본문에서 카테고리 이름과 슬러그를 추출합니다.
 * - fetch를 사용하여 새로운 카테고리를 추가하기 위한 POST 요청을 보냅니다.
 * 
 * 요청이 실패할 경우, 적절한 오류 메시지를 생성하여 반환합니다.
 */
export default defineEventHandler(async (event) => {
  const method = event.node.req.method // 요청 메서드 가져오기
  let url = 'http://localhost:3001/api/categories' // 기본 카테고리 API URL 설정

  // GET 요청인 경우
  if (method === 'GET') {
    // 요청 URL에서 쿼리 문자열 추출
    const oriUrl = event.node.req.url
    const queryString = oriUrl.includes('?')
      ? oriUrl.substring(oriUrl.indexOf('?') + 1)
      : '';
    const searchParams = new URLSearchParams(queryString); // 쿼리 문자열을 URLSearchParams 객체로 변환
    const id = searchParams.get('id'); // 카테고리 ID 가져오기
    if (id?.length > 0) url += `?id=${id}` // 특정 카테고리 조회를 위한 쿼리 문자열 추가

    // include=uncategorized 쿼리 문자열 추가
    if (searchParams.get('include') === 'uncategorized') {
      url += `?include=uncategorized`
    }

    // include=uncategorized_all 쿼리 문자열 추가
    if (searchParams.get('include') === 'uncategorized_all') {
      url += `?include=uncategorized_all`
    }

    const response = await fetch(url) // 카테고리 정보를 요청

    // 응답이 실패한 경우 에러 처리
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to fetch categories',
      })
    }

    return response.json() // 카테고리 정보 반환
  }

  // POST 요청인 경우
  if (method === 'POST') {
    const body = await readBody(event) // 요청 본문 읽기
    const { name, slug } = body // 카테고리 이름과 슬러그 추출

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, slug }), // 카테고리 추가를 위한 요청 본문
    })

    // 응답이 실패한 경우 에러 처리
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to add category',
      })
    }

    return response.json() // 추가된 카테고리 정보 반환
  }

  // PUT 요청인 경우
  if (method === 'PUT') {
    const body = await readBody(event) // 요청 본문 읽기

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body), // 카테고리 업데이트를 위한 요청 본문
    })

    // 응답이 실패한 경우 에러 처리
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to update categories',
      })
    }

    return response.json() // 업데이트된 카테고리 정보 반환
  }

  // DELETE 요청인 경우
  if (method === 'DELETE') {
    const { id } = event.context.params || {} // URL 파라미터에서 ID 가져오기
    const deleteUrl = `${url}/${id}` // 삭제할 카테고리 URL 설정

    const response = await fetch(deleteUrl, {
      method: 'DELETE', // DELETE 요청
    })

    // 응답이 실패한 경우 에러 처리
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to delete category',
      })
    }

    return response.json() // 삭제된 카테고리 정보 반환
  }
})
