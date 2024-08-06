import { defineEventHandler } from 'h3'
import fetch from 'node-fetch'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  let url = 'http://localhost:3001/api/categories'

  // GET 요청인 경우
  if (method === 'GET') {
    // '?' 이후의 모든 것을 쿼리 문자열로 간주
    const oriUrl = event.node.req.url
    const queryString = oriUrl.includes('?')
      ? oriUrl.substring(oriUrl.indexOf('?') + 1)
      : '';
    const searchParams = new URLSearchParams(queryString);
    const id = searchParams.get('id');
    if (id?.length > 0) url += `?id=${id}` // 특정 카테고리 조회 (쿼리스트링)

    const response = await fetch(url)

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to fetch categories',
      })
    }

    return response.json()
  }

  // POST 요청인 경우
  if (method === 'POST') {
    const body = await readBody(event)
    const { name, slug } = body

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, slug }),
    })

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to add category',
      })
    }

    return response.json()
  }

  // PUT 요청인 경우
  if (method === 'PUT') {
    const body = await readBody(event)

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to update categories',
      })
    }

    return response.json()
  }

  // DELETE 요청인 경우
  if (method === 'DELETE') {
    const { id } = event.context.params || {}
    const deleteUrl = `${url}/${id}`

    const response = await fetch(deleteUrl, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to delete category',
      })
    }

    return response.json()
  }
})
