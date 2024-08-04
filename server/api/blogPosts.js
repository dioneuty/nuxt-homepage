import { defineEventHandler } from 'h3'
import fetch from 'node-fetch'

export default defineEventHandler(async () => {
    const response = await fetch('http://localhost:3001/api/blogPosts')
  return response.json()
})