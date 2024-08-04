import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

// 로깅 함수
function logQuery(query, params) {
  console.log('Executing query:', query);
  if (params) {
    console.log('with params:', params);
  }
}

// 데이터베이스 연결
const db = new Database(path.join(__dirname, 'server', 'db', 'database.sqlite'));

// JSON 파싱 미들웨어
app.use(express.json());

// 블로그 포스트 API
app.get('/api/blogPosts', (req, res) => {
  const query = 'SELECT id, title, content FROM blog_posts';
  logQuery(query);
  const posts = db.prepare(query).all();
  res.json(posts);
});

app.get('/api/blogPosts/:id', (req, res) => {
  const query = 'SELECT * FROM blog_posts WHERE id = ?';
  const params = [req.params.id];
  logQuery(query, params);
  const post = db.prepare(query).get(params);
  if (post) {
    res.json(post);
  } else {
    res.status(404).json({ error: 'Blog post not found' });
  }
});

app.post('/api/addBlogPost', (req, res) => {
  const { title, content } = req.body;
  const query = 'INSERT INTO blog_posts (title, content) VALUES (?, ?)';
  const params = [title, content];
  logQuery(query, params);
  const stmt = db.prepare(query);
  const result = stmt.run(params);
  if (result.changes > 0) {
    res.json({ success: true, id: result.lastInsertRowid });
  } else {
    res.status(500).json({ error: 'Failed to insert blog post' });
  }
});

// 게시판 포스트 API
app.get('/api/boardPosts', (req, res) => {
  const query = 'SELECT id, title FROM board_posts';
  logQuery(query);
  const posts = db.prepare(query).all();
  res.json(posts);
});

app.get('/api/boardPosts/:id', (req, res) => {
  const query = 'SELECT * FROM board_posts WHERE id = ?';
  const params = [req.params.id];
  logQuery(query, params);
  const post = db.prepare(query).get(params);
  if (post) {
    res.json(post);
  } else {
    res.status(404).json({ error: 'Board post not found' });
  }
});

app.listen(port, () => {
  console.log(`Database server running on port ${port}`);
});