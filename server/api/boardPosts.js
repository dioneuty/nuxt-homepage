import { defineEventHandler } from 'h3'
import fetch from 'node-fetch'

export default defineEventHandler(async () => {
  const response = await fetch('http://localhost:3001/api/boardPosts')
  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: 'Failed to fetch board posts',
    })
  }
  return response.json()
})