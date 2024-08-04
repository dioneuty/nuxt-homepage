import { defineEventHandler } from 'h3'
import fetch from 'node-fetch'

export default defineEventHandler(async (event) => {
  const id = event.context.params.id
  const response = await fetch(`http://localhost:3001/api/blogPosts/${id}`)
  
  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: 'Blog post not found',
    })
  }
  
  return response.json()
})