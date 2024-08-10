import { defineEventHandler } from 'h3'
import fetch from 'node-fetch'

/**
 * 이 핸들러 함수는 게시판 포스트 관련 API 요청을 처리합니다.
 * 
 * @param {object} event - H3 이벤트 객체로, 요청 및 응답에 대한 정보를 포함합니다.
 * 
 * 이 함수는 HTTP 메서드에 따라 GET 또는 POST 요청을 처리합니다.
 * 
 * GET 요청의 경우:
 * - 요청 URL에서 쿼리 문자열을 추출하여 특정 게시판 포스트 ID, 페이지 번호, 페이지당 포스트 수, 검색 타입 및 검색 텍스트를 가져옵니다.
 * - 해당 ID 또는 쿼리 매개변수에 따라 게시판 포스트 목록을 가져오기 위해 API를 호출합니다.
 * - API 호출 결과를 JSON 형식으로 반환합니다.
 * 
 * POST 요청의 경우:
 * - 요청 본문에서 게시판 포스트의 제목, 내용 및 카테고리 ID를 추출합니다.
 * - 새로운 게시판 포스트를 추가하기 위해 API에 POST 요청을 보냅니다.
 * - API 호출 결과를 JSON 형식으로 반환합니다.
 * 
 * 요청이 실패할 경우, 적절한 오류 메시지를 생성하여 반환합니다.
 */
export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  let url = 'http://localhost:3001/api/boardPosts'

  // GET 요청인 경우
  // 게시판 포스트 목록 조회
  if (method === 'GET') {
    // '?' 이후의 모든 것을 쿼리 문자열로 간주
    const oriUrl = event.node.req.url
    const queryString = oriUrl.includes('?')
      ? oriUrl.substring(oriUrl.indexOf('?') + 1)
      : '';
    const searchParams = new URLSearchParams(queryString);
    
    const id = searchParams.get('id');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const searchType = searchParams.get('searchType');
    const searchText = searchParams.get('searchText');

    if (id?.length > 0) {
      url += `?id=${id}`; //상세 페이지, 수정 페이지 (쿼리스트링)
    } else {
      // 목록 페이지 (페이지네이션 및 검색)
      const queryParams = new URLSearchParams();
      if (page) queryParams.append('page', page);
      if (limit) queryParams.append('limit', limit);
      if (searchType) queryParams.append('searchType', searchType);
      if (searchText) queryParams.append('searchText', searchText);
      
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    const response = await fetch(url)

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to fetch board posts',
      })
    }

    return response.json()
    
  }

  // POST 요청인 경우
  // 게시판 포스트 추가
  if (method === 'POST') {
    const body = await readBody(event)
    const { title, content, author } = body

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content, author}),
    })

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to insert board post',
      })
    }

    return response.json()
  }

  // PUT 요청인 경우
  // 게시판 포스트 수정
  if (method === 'PUT') {
    const body = await readBody(event)
    const { title, content, author, id } = body

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content, author, id }),
    })

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to update board post',
      })
    }

    return response.json()
  }

  // DELETE 요청인 경우
  // 게시판 포스트 삭제
  if (method === 'DELETE') {
    const body = await readBody(event)
    const { id } = body
  
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    })
  
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to insert board post',
      })
    }

    return response.json()
  }
})