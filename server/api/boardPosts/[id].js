import { defineEventHandler } from 'h3'
import fetch from 'node-fetch'

export default defineEventHandler(async (event) => {
  const id = event.context.params.id
  const response = await fetch(`http://localhost:3001/api/boardPosts/${id}`)
  
  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: 'Board post not found',
    })
  }
  
  return response.json()
})