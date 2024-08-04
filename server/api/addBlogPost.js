import { defineEventHandler, readBody } from 'h3'
import fetch from 'node-fetch'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { title, content } = body

  const response = await fetch('http://localhost:3001/api/addBlogPost', {
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
})