import { defineEventHandler } from 'h3'
import fetch from 'node-fetch'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  let url = 'http://localhost:3001/api/blogPosts'

  // GET 요청인 경우
  if (method === 'GET') {
    // '?' 이후의 모든 것을 쿼리 문자열로 간주
    const oriUrl = event.node.req.url
    const queryString = oriUrl.includes('?')
      ? oriUrl.substring(oriUrl.indexOf('?') + 1)
      : '';
    const searchParams = new URLSearchParams(queryString);
    const id = searchParams.get('id');
    if (id?.length > 0) url += `?id=${id}` //상세 페이지, 수정 페이지 (쿼리스트링)

    //console.log(id)

    const response = await fetch(url)

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to fetch blog posts',
      })
    }
    
    return response.json()
  }

  // POST 요청인 경우
  if (method === 'POST') {
    const body = await readBody(event)
    const { title, content } = body

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content }),
    })

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to insert blog post',
      })
    }

    return response.json()
  }

  // PUT 요청인 경우
  if (method === 'PUT') {
    const body = await readBody(event)
    const { title, content, id } = body

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content, id }),
    })

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to update blog post',
      })
    }

    return response.json()
  }

  // DELETE 요청인 경우
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
        statusMessage: 'Failed to delete blog post',
      })
    }

    return response.json()
  }
})