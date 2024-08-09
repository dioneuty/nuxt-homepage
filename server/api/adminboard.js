import { defineEventHandler, readBody } from 'h3';
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api/adminboard';

/**
 * 이 핸들러 함수는 관리자 게시판 관련 API 요청을 처리합니다.
 * 
 * @param {object} event - H3 이벤트 객체로, 요청 및 응답에 대한 정보를 포함합니다.
 * 
 * 이 함수는 HTTP 메서드에 따라 GET, POST, PUT, DELETE 요청을 처리합니다.
 */
export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  // GET 요청
  if (method === 'GET') {
    const oriUrl = event.node.req.url;
    const queryString = oriUrl.includes('?') ? oriUrl.substring(oriUrl.indexOf('?') + 1) : '';
    const searchParams = new URLSearchParams(queryString);
    const id = searchParams.get('id');

    const url = id ? `${BASE_URL}?id=${id}` : BASE_URL;

    const response = await fetch(url);
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to fetch admin board posts',
      });
    }

    return response.json(); // 게시판 포스트 응답
  }

  // POST 요청
  if (method === 'POST') {
    const body = await readBody(event); // 요청 본문 읽기
    const { title, content } = body; // 본문에서 데이터 추출

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content }), // JSON 형식으로 데이터 전송
    });

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to insert admin board post',
      });
    }

    return response.json(); // 성공 응답
  }

  // PUT 요청
  if (method === 'PUT') {
    const body = await readBody(event); // 요청 본문 읽기
    const { id, title, content } = body; // 본문에서 데이터 추출

    const response = await fetch(BASE_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, title, content }), // JSON 형식으로 데이터 전송
    });

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to update admin board post',
      });
    }

    return response.json(); // 성공 응답
  }

  // DELETE 요청
  if (method === 'DELETE') {
    const body = await readBody(event); // 요청 본문 읽기
    const { id } = body; // 본문에서 ID 추출

    const response = await fetch(BASE_URL, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }), // JSON 형식으로 데이터 전송
    });

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to delete admin board post',
      });
    }

    return response.json(); // 성공 응답
  }
});