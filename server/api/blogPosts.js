import { defineEventHandler } from 'h3' // h3 라이브러리에서 이벤트 핸들러 임포트
import fetch from 'node-fetch' // node-fetch 라이브러리 임포트

/**
 * 이 핸들러 함수는 블로그 포스트 관련 API 요청을 처리합니다.
 * 
 * @param {object} event - H3 이벤트 객체로, 요청 및 응답에 대한 정보를 포함합니다.
 * 
 * 이 함수는 HTTP 메서드에 따라 GET 또는 POST 요청을 처리합니다.
 * 
 * GET 요청의 경우:
 * - 요청 URL에서 쿼리 문자열을 추출하여 특정 블로그 포스트 ID 또는 카테고리를 가져옵니다.
 * - 해당 ID 또는 카테고리에 따라 블로그 포스트 목록을 가져오기 위해 API를 호출합니다.
 * - API 호출 결과를 JSON 형식으로 반환합니다.
 * 
 * POST 요청의 경우:
 * - 요청 본문에서 블로그 포스트의 제목, 내용 및 카테고리 ID를 추출합니다.
 * - 새로운 블로그 포스트를 추가하기 위해 API에 POST 요청을 보냅니다.
 * - API 호출 결과를 JSON 형식으로 반환합니다.
 * 
 * 요청이 실패할 경우, 적절한 오류 메시지를 생성하여 반환합니다.
 */
export default defineEventHandler(async (event) => {
  const method = event.node.req.method // 요청 메서드 가져오기
  let url = 'http://localhost:3001/api/blogPosts' // 기본 API URL 설정

  // GET 요청인 경우
  if (method === 'GET') {
    const oriUrl = event.node.req.url // 원래 요청 URL 가져오기
    const queryString = oriUrl.includes('?')
      ? oriUrl.substring(oriUrl.indexOf('?') + 1) // 쿼리 문자열 추출
      : '';
    const searchParams = new URLSearchParams(queryString); // URLSearchParams 객체 생성
    const id = searchParams.get('id'); // 쿼리에서 id 가져오기
    const category = searchParams.get('category'); // 쿼리에서 category 가져오기
    
    // id가 있는 경우
    if (id?.length > 0) {
      url += `?id=${id}` // URL에 id 추가
    } else if (category?.length > 0) {
      url += `?category=${category}` // URL에 category 추가
    }

    const response = await fetch(url) // API 호출

    // 응답이 실패한 경우 에러 처리
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to fetch blog posts', // 에러 메시지
      })
    }
    
    return response.json() // JSON 형식으로 응답 반환
  }

  // POST 요청인 경우
  if (method === 'POST') {
    const body = await readBody(event) // 요청 본문 읽기
    const { title, content, category_id } = body // 본문에서 데이터 추출

    const response = await fetch(url, {
      method: 'POST', // POST 메서드 설정
      headers: {
        'Content-Type': 'application/json', // JSON 형식으로 데이터 전송
      },
      body: JSON.stringify({ title, content, category_id }), // 본문 데이터 JSON 문자열로 변환
    })

    // 응답이 실패한 경우 에러 처리
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to insert blog post', // 에러 메시지
      })
    }

    return response.json() // JSON 형식으로 응답 반환
  }

  // PUT 요청인 경우
  if (method === 'PUT') {
    const body = await readBody(event) // 요청 본문 읽기
    const { title, content, id, category_id } = body // 본문에서 데이터 추출

    const response = await fetch(url, {
      method: 'PUT', // PUT 메서드 설정
      headers: {
        'Content-Type': 'application/json', // JSON 형식으로 데이터 전송
      },
      body: JSON.stringify({ title, content, id, category_id }), // 본문 데이터 JSON 문자열로 변환
    })

    // 응답이 실패한 경우 에러 처리
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to update blog post', // 에러 메시지
      })
    }

    return response.json() // JSON 형식으로 응답 반환
  }

  // DELETE 요청인 경우
  if (method === 'DELETE') {
    const body = await readBody(event) // 요청 본문 읽기
    const { id } = body // 본문에서 id 추출
  
    const response = await fetch(url, {
      method: 'DELETE', // DELETE 메서드 설정
      headers: {
        'Content-Type': 'application/json', // JSON 형식으로 데이터 전송
      },
      body: JSON.stringify({ id }), // 본문 데이터 JSON 문자열로 변환
    })
  
    // 응답이 실패한 경우 에러 처리
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to delete blog post', // 에러 메시지
      })
    }

    return response.json() // JSON 형식으로 응답 반환
  }
})