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
  const id = req.query.id

  if (id) { // 상세 페이지, 수정 페이지
    const query = 'SELECT * FROM blog_posts WHERE id = ?';
    const params = [id];
    logQuery(query, params);
    const post = db.prepare(query).get(params);
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ error: 'Blog post not found' });
    }
  }else{ // 목록 페이지
    const query = 'SELECT * FROM blog_posts ORDER BY id DESC';
    logQuery(query);
    const posts = db.prepare(query).all();
    res.json(posts);
  }
});

// boardPosts
app.get('/api/boardPosts', (req, res) => {
  const id = req.query.id

  if (id) { // 상세 페이지, 수정 페이지
    const query = 'SELECT * FROM board_posts WHERE id = ?';
    const params = [id];
    logQuery(query, params);
    const post = db.prepare(query).get(params);
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ error: 'Board post not found' });
    }
  }else{ // 목록 페이지
    const query = 'SELECT * FROM board_posts ORDER BY id DESC';
    logQuery(query);
    const posts = db.prepare(query).all();
    res.json(posts);
  }
});

// addBlogPost API
app.post('/api/blogPosts', (req, res) => {
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


// addBoardPost API
app.post('/api/boardPosts', (req, res) => {
  const { title, content } = req.body;
  const query = 'INSERT INTO board_posts (title, content) VALUES (?, ?)';
  const params = [title, content];
  
  logQuery(query, params);
  
  try {
    const info = db.prepare(query).run(params);
    res.status(201).json({ 
      message: 'Board post created successfully', 
      id: info.lastInsertRowid 
    });
  } catch (error) {
    console.error('Error creating board post:', error);
    res.status(500).json({ error: 'Failed to create board post' });
  }
});

// delBoardPost API
app.delete('/api/boardPosts/', (req, res) => {
  const { id } = req.body;
  const query = 'DELETE FROM board_posts WHERE id = ?';
  const params = [id];
  logQuery(query, params);
  try {
    const result = db.prepare(query).run(params);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting board post:', error);
    res.status(500).json({ error: 'Failed to delete board post' });
  }
});

// delBlogPost API
app.delete('/api/blogPosts/', (req, res) => {
  const { id } = req.body;
  const query = 'DELETE FROM blog_posts WHERE id = ?';
  const params = [id];
  logQuery(query, params);
  try { 
    const result = db.prepare(query).run(params);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

// updBoardPost API
app.put('/api/boardPosts/', (req, res) => {
  const { title, content, id} = req.body;
  const query = 'UPDATE board_posts SET title = ?, content = ? WHERE id = ?';
  const params = [title, content, id];
  logQuery(query, params);

  try {
    const result = db.prepare(query).run(params);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating board post:', error);
    res.status(500).json({ error: 'Failed to update board post' });
  }
});

// updBlogPost API  
app.put('/api/blogPosts/', (req, res) => {
  const { title, content, id } = req.body;
  const query = 'UPDATE blog_posts SET title = ?, content = ? WHERE id = ?';
  const params = [title, content, id];
  logQuery(query, params);
  
  try {
    const result = db.prepare(query).run(params);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});



app.listen(port, () => {
  console.log(`Database server running on port ${port}`);
});