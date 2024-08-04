import { defineEventHandler, createError } from 'h3'
import Database from 'better-sqlite3'
import path from 'path'

const db = new Database(path.join(process.cwd(), 'server/db/database.sqlite'))

export default defineEventHandler((event) => {
  const id = event.context.params.id
  const post = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(id)
  
  if (!post) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Blog post not found',
    })
  }
  
  return post
})