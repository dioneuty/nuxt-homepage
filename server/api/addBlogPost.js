import { defineEventHandler, readBody } from 'h3'
import Database from 'better-sqlite3'
import path from 'path'

const db = new Database(path.join(process.cwd(), 'server/db/database.sqlite'))

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { title, content } = body

  const stmt = db.prepare('INSERT INTO blog_posts (title, content) VALUES (?, ?)')
  const result = stmt.run(title, content)

  if (result.changes > 0) {
    return { success: true, id: result.lastInsertRowid }
  } else {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to insert blog post',
    })
  }
})