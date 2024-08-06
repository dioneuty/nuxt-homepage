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
// 카테고리별 블로그 포스트 조회 및 전체 블로그 포스트 조회
app.get('/api/blogPosts', (req, res) => {
  const id = req.query.id
  const category = req.query.category

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
  } else if (category) { // 카테고리별 조회
    const query = 'SELECT * FROM blog_posts WHERE category_id = ? ORDER BY id DESC';
    const params = [category];
    logQuery(query, params);
    const posts = db.prepare(query).all(params);
    res.json(posts);
  } else { // 전체 목록 페이지
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
  const { title, content, category_id } = req.body;
  const query = 'INSERT INTO blog_posts (title, content, category_id) VALUES (?, ?, ?)';
  const params = [title, content, category_id];
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
  console.log(req.body);
  const { title, content, id, category_id } = req.body;

  // category_id가 undefined인 경우 0으로 설정
  const categoryIdValue = category_id === undefined ? 0 : category_id;

  const query = 'UPDATE blog_posts SET title = ?, content = ?, category_id = ? WHERE id = ?';
  const params = [title, content, categoryIdValue, id];
  logQuery(query, params);
  
  try {
    const result = db.prepare(query).run(params);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

// 카테고리 목록과 각 카테고리의 글 개수를 가져오는 API 엔드포인트
app.get('/api/categories', (req, res) => {
  try {
    const query = `
      SELECT c.id, c.name, c.slug, COUNT(b.id) as post_count
      FROM categories c
      LEFT JOIN blog_posts b ON c.id = b.category_id
      GROUP BY c.id
      ORDER BY c.name
    `;
    const categories = db.prepare(query).all();
    
    // 미카테고리 글 개수 계산
    const uncategorizedQuery = `
      SELECT COUNT(*) as count
      FROM blog_posts
      WHERE category_id IS NULL OR category_id = 0
    `;
    const uncategorizedCount = db.prepare(uncategorizedQuery).get().count;
    
    // '미카테고리' 옵션 추가
    categories.unshift({
      id: 0,
      name: '미카테고리',
      slug: 'uncategorized',
      post_count: uncategorizedCount
    });

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// addCategory API
app.post('/api/categories', (req, res) => {
  const { name, slug } = req.body;
  const query = 'INSERT INTO categories (name, slug) VALUES (?, ?)';
  const params = [name, slug];
  logQuery(query, params);
  try {
    const result = db.prepare(query).run(params);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ error: 'Failed to add category' });
  }
});

// updateCategories API
app.put('/api/categories', (req, res) => {
  const categories = req.body;
  const categoryIds = categories.map(cat => cat.id).filter(id => id !== undefined);
  const updateQuery = 'UPDATE categories SET name = ?, slug = ? WHERE id = ?';
  let deleteQuery = 'DELETE FROM categories WHERE id NOT IN (?)';
  const updatePostsQuery = 'UPDATE blog_posts SET category_id = 0 WHERE category_id NOT IN (?)';
  
  try {
    db.prepare('BEGIN').run();
    
    categories.forEach(category => {
      if (category.id) {
        const params = [category.name, category.slug, category.id];
        logQuery(updateQuery, params);
        db.prepare(updateQuery).run(params);
      } else {
        // 새 카테고리 추가
        const insertQuery = 'INSERT INTO categories (name, slug) VALUES (?, ?)';
        const params = [category.name, category.slug];
        logQuery(insertQuery, params);
        const result = db.prepare(insertQuery).run(params);
        categoryIds.push(result.lastInsertRowid);
      }
    });
    
    if (categoryIds.length > 0) {
      deleteQuery = `DELETE FROM categories WHERE id NOT IN (${categoryIds.join(',')})`;
      logQuery(deleteQuery);
      db.prepare(deleteQuery).run();
      
      // 삭제된 카테고리에 속한 글들을 미카테고리로 변경
      const updatePostsParams = categoryIds.join(',');
      logQuery(updatePostsQuery, [updatePostsParams]);
      db.prepare(updatePostsQuery).run(updatePostsParams);
    }
    
    db.prepare('COMMIT').run();
    res.json({ success: true });
  } catch (error) {
    db.prepare('ROLLBACK').run();
    console.error('Error updating categories:', error);
    res.status(500).json({ error: 'Failed to update categories' });
  }
});

// deleteCategory API
app.delete('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  
  try {
    db.prepare('BEGIN').run();
    
    // 해당 카테고리의 글들을 미카테고리로 변경
    db.prepare('UPDATE blog_posts SET category_id = 0 WHERE category_id = ?').run(id);
    
    // 카테고리 삭제
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    
    db.prepare('COMMIT').run();
    
    res.json({ success: true });
  } catch (error) {
    db.prepare('ROLLBACK').run();
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});




app.listen(port, () => {
  console.log(`Database server running on port ${port}`);
});