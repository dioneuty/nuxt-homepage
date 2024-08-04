import { defineEventHandler } from 'h3'
import Database from 'better-sqlite3'
import path from 'path'

const db = new Database(path.join(process.cwd(), 'server/db/database.sqlite'))

export default defineEventHandler(() => {
  const posts = db.prepare('SELECT id, title FROM board_posts').all()
  return posts
})