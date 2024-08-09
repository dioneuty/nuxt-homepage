import express from 'express'; // Express 프레임워크 임포트
import Database from 'better-sqlite3'; // SQLite3 데이터베이스 임포트
import path from 'path'; // 경로 관련 모듈 임포트
import { fileURLToPath } from 'url'; // URL 관련 모듈 임포트
import cors from 'cors'; // CORS 미들웨어 임포트
import multer from 'multer'; // 파일 업로드 미들웨어 임포트

const __filename = fileURLToPath(import.meta.url); // 현재 파일의 경로
const __dirname = path.dirname(__filename); // 현재 디렉토리 경로

const app = express(); // Express 애플리케이션 생성
const port = process.env.PORT || 3001; // 포트 설정

app.use(cors()); // CORS 미들웨어 사용

// 로깅 함수
function logQuery(query, params) {
  console.log('Executing query:', query); // 실행 중인 쿼리 로그
  if (params) {
    console.log('with params:', params); // 쿼리 파라미터 로그
  }
}

// 데이터베이스 연결
const db = new Database(path.join(__dirname, 'server', 'db', 'database.sqlite')); // SQLite 데이터베이스 연결

// JSON 파싱 미들웨어 설정 (최대 크기 증가)
app.use(express.json({ limit: '50mb' })); // JSON 요청 본문 파싱
app.use(express.urlencoded({ limit: '50mb', extended: true })); // URL 인코딩된 요청 본문 파싱

// multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); // 파일 업로드 경로 설정
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // 파일 이름 설정
  }
});
const upload = multer({ storage: storage }); // multer 인스턴스 생성

// 블로그 포스트 API
/**
 * GET /api/blogPosts
 * 블로그 포스트 목록을 가져오거나 특정 포스트를 조회합니다.
 * 
 * 입력 파라미터:
 * - id: 포스트 ID (선택적)
 * - category: 카테고리 ID (선택적)
 * 
 * 출력 값:
 * - 포스트 객체 또는 포스트 목록
 */
app.get('/api/blogPosts', (req, res) => {
  const id = req.query.id; // 쿼리에서 ID 가져오기
  const category = req.query.category; // 쿼리에서 카테고리 가져오기
  console.log(category); // 카테고리 로그

  if (id) { // 상세 페이지, 수정 페이지
    const query = 'SELECT * FROM blog_posts WHERE id = ?'; // 쿼리 설정
    const params = [id]; // 파라미터 설정
    logQuery(query, params); // 쿼리 로그
    const post = db.prepare(query).get(params); // 데이터베이스에서 포스트 가져오기
    if (post) {
      res.json(post); // 포스트 응답
    } else {
      res.status(404).json({ error: 'Blog post not found' }); // 포스트 없음 응답
    }
  } else if (category && category != -1) { // 카테고리별 조회
    const query = 'SELECT * FROM blog_posts WHERE category_id = ? ORDER BY id DESC'; // 쿼리 설정
    const params = [category]; // 파라미터 설정
    logQuery(query, params); // 쿼리 로그
    const posts = db.prepare(query).all(params); // 데이터베이스에서 포스트 목록 가져오기
    res.json(posts); // 포스트 목록 응답
  } else { // 전체 목록 페이지
    const query = 'SELECT * FROM blog_posts ORDER BY id DESC'; // 쿼리 설정
    logQuery(query); // 쿼리 로그
    const posts = db.prepare(query).all(); // 데이터베이스에서 모든 포스트 가져오기
    res.json(posts); // 포스트 목록 응답
  }
});

/**
 * GET /api/boardPosts
 * 게시판 포스트 목록을 가져오거나 특정 포스트를 조회합니다.
 * 
 * 입력 파라미터:
 * - id: 포스트 ID (선택적)
 * - page: 페이지 번호 (기본값: 1)
 * - limit: 페이지당 포스트 수 (기본값: 10)
 * - searchType: 검색 타입 (author, title, content 중 하나)
 * - searchText: 검색 텍스트
 * 
 * 출력 값:
 * - 포스트 객체 또는 포스트 목록
 */
app.get('/api/boardPosts', (req, res) => {
  const id = req.query.id; // 쿼리에서 ID 가져오기
  const { page = 1, limit = 10, searchType, searchText } = req.query; // 페이지, 제한, 검색 타입, 검색 텍스트 가져오기

  if (id && id !== -1) { // 상세 페이지, 수정 페이지
    const query = 'SELECT * FROM board_posts WHERE id = ?'; // 쿼리 설정
    const params = [id]; // 파라미터 설정
    logQuery(query, params); // 쿼리 로그
    const post = db.prepare(query).get(params); // 데이터베이스에서 포스트 가져오기
    if (post) {
      res.json(post); // 포스트 응답
    } else {
      res.status(404).json({ error: 'Board post not found' }); // 포스트 없음 응답
    }
  } else { // 목록 페이지
    const offset = (page - 1) * limit; // 오프셋 계산
    let query = 'SELECT * FROM board_posts'; // 기본 쿼리 설정
    let countQuery = 'SELECT COUNT(*) as total FROM board_posts'; // 총 개수 쿼리 설정
    let params = []; // 파라미터 배열 초기화

    if (searchText) { // 검색 텍스트가 있는 경우
      query += ' WHERE'; // WHERE 절 추가
      countQuery += ' WHERE'; // COUNT 쿼리에도 WHERE 절 추가
      if (searchType === 'author') {
        query += ' author LIKE ?'; // 저자 검색
        countQuery += ' author LIKE ?'; // 저자 검색
      } else if (searchType === 'title') {
        query += ' title LIKE ?'; // 제목 검색
        countQuery += ' title LIKE ?'; // 제목 검색
      } else if (searchType === 'content') {
        query += ' content LIKE ?'; // 내용 검색
        countQuery += ' content LIKE ?'; // 내용 검색
      }
      params.push(`%${searchText}%`); // 파라미터에 검색 텍스트 추가
    }

    query += ' ORDER BY id DESC LIMIT ? OFFSET ?'; // 정렬 및 제한 추가
    params.push(parseInt(limit), offset); // 페이지 제한 및 오프셋 추가

    logQuery(query, params); // 쿼리 로그
    logQuery(countQuery, params.slice(0, -2)); // 총 개수 쿼리 로그

    const posts = db.prepare(query).all(params); // 데이터베이스에서 포스트 목록 가져오기
    const totalCount = db.prepare(countQuery).get(params.slice(0, -2)); // 총 개수 가져오기

    res.json({ // 응답
      posts,
      total: totalCount.total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  }
});

/**
 * POST /api/blogPosts
 * 새로운 블로그 포스트를 추가합니다.
 * 
 * 입력 파라미터:
 * - title: 포스트 제목
 * - content: 포스트 내용
 * - category_id: 카테고리 ID
 * 
 * 출력 값:
 * - 성공 여부 및 새로 생성된 포스트 ID
 */
app.post('/api/blogPosts', (req, res) => {
  const { title, content, category_id } = req.body; // 요청 본문에서 데이터 가져오기
  const query = 'INSERT INTO blog_posts (title, content, category_id) VALUES (?, ?, ?)'; // 쿼리 설정
  const params = [title, content, category_id]; // 파라미터 설정
  logQuery(query, params); // 쿼리 로그
  const stmt = db.prepare(query); // 쿼리 준비
  const result = stmt.run(params); // 쿼리 실행
  if (result.changes > 0) {
    res.json({ success: true, id: result.lastInsertRowid }); // 성공 응답
  } else {
    res.status(500).json({ error: 'Failed to insert blog post' }); // 실패 응답
  }
});

/**
 * POST /api/boardPosts
 * 새로운 게시판 포스트를 추가합니다.
 * 
 * 입력 파라미터:
 * - title: 포스트 제목
 * - content: 포스트 내용
 * 
 * 출력 값:
 * - 성공 여부 및 새로 생성된 포스트 ID
 */
app.post('/api/boardPosts', (req, res) => {
  const { title, content } = req.body; // 요청 본문에서 데이터 가져오기
  const query = 'INSERT INTO board_posts (title, content) VALUES (?, ?)'; // 쿼리 설정
  const params = [title, content]; // 파라미터 설정
  
  logQuery(query, params); // 쿼리 로그
  
  try {
    const info = db.prepare(query).run(params); // 쿼리 실행
    res.status(201).json({ // 성공 응답
      message: 'Board post created successfully', 
      id: info.lastInsertRowid 
    });
  } catch (error) {
    console.error('Error creating board post:', error); // 에러 로그
    res.status(500).json({ error: 'Failed to create board post' }); // 실패 응답
  }
});

/**
 * DELETE /api/boardPosts
 * 특정 게시판 포스트를 삭제합니다.
 * 
 * 입력 파라미터:
 * - id: 삭제할 포스트 ID
 * 
 * 출력 값:
 * - 성공 여부
 */
app.delete('/api/boardPosts/', (req, res) => {
  const { id } = req.body; // 요청 본문에서 ID 가져오기
  const query = 'DELETE FROM board_posts WHERE id = ?'; // 쿼리 설정
  const params = [id]; // 파라미터 설정
  logQuery(query, params); // 쿼리 로그
  try {
    const result = db.prepare(query).run(params); // 쿼리 실행
    res.json({ success: true }); // 성공 응답
  } catch (error) {
    console.error('Error deleting board post:', error); // 에러 로그
    res.status(500).json({ error: 'Failed to delete board post' }); // 실패 응답
  }
});

/**
 * DELETE /api/blogPosts
 * 특정 블로그 포스트를 삭제합니다.
 * 
 * 입력 파라미터:
 * - id: 삭제할 포스트 ID
 * 
 * 출력 값:
 * - 성공 여부
 */
app.delete('/api/blogPosts/', (req, res) => {
  const { id } = req.body; // 요청 본문에서 ID 가져오기
  const query = 'DELETE FROM blog_posts WHERE id = ?'; // 쿼리 설정
  const params = [id]; // 파라미터 설정
  logQuery(query, params); // 쿼리 로그
  try { 
    const result = db.prepare(query).run(params); // 쿼리 실행
    res.json({ success: true }); // 성공 응답
  } catch (error) {
    console.error('Error deleting blog post:', error); // 에러 로그
    res.status(500).json({ error: 'Failed to delete blog post' }); // 실패 응답
  }
});

/**
 * PUT /api/boardPosts
 * 특정 게시판 포스트를 업데이트합니다.
 * 
 * 입력 파라미터:
 * - id: 업데이트할 포스트 ID
 * - title: 포스트 제목
 * - content: 포스트 내용
 * - author: 포스트 저자
 * 
 * 출력 값:
 * - 성공 여부
 */
app.put('/api/boardPosts/', (req, res) => {
  const { title, content, id, author } = req.body; // 요청 본문에서 데이터 가져오기
  const query = 'UPDATE board_posts SET title = ?, content = ?, author = ? WHERE id = ?'; // 쿼리 설정
  const params = [title, content, author, id]; // 파라미터 설정
  logQuery(query, params); // 쿼리 로그

  try {
    const result = db.prepare(query).run(params); // 쿼리 실행
    res.json({ success: true }); // 성공 응답
  } catch (error) {
    console.error('Error updating board post:', error); // 에러 로그
    res.status(500).json({ error: 'Failed to update board post' }); // 실패 응답
  }
});

/**
 * PUT /api/blogPosts
 * 특정 블로그 포스트를 업데이트합니다.
 * 
 * 입력 파라미터:
 * - id: 업데이트할 포스트 ID
 * - title: 포스트 제목
 * - content: 포스트 내용
 * - category_id: 카테고리 ID
 * 
 * 출력 값:
 * - 성공 여부
 */
app.put('/api/blogPosts/', (req, res) => {
  const { title, content, id, category_id } = req.body; // 요청 본문에서 데이터 가져오기

  // category_id가 undefined인 경우 0으로 설정
  const categoryIdValue = category_id === undefined ? 0 : category_id; // 카테고리 ID 설정

  const query = 'UPDATE blog_posts SET title = ?, content = ?, category_id = ? WHERE id = ?'; // 쿼리 설정
  const params = [title, content, categoryIdValue, id]; // 파라미터 설정
  logQuery(query, params); // 쿼리 로그
  
  try {
    const result = db.prepare(query).run(params); // 쿼리 실행
    res.json({ success: true }); // 성공 응답
  } catch (error) {
    console.error('Error updating blog post:', error); // 에러 로그
    res.status(500).json({ error: 'Failed to update blog post' }); // 실패 응답
  }
});

/**
 * GET /api/categories
 * 카테고리 목록과 각 카테고리의 글 개수를 가져옵니다.
 * 
 * 입력 파라미터:
 * - include: 포함할 항목 (uncategorized, all)
 * 
 * 출력 값:
 * - 카테고리 목록
 */
app.get('/api/categories', (req, res) => {
  const include = req.query.include; // 쿼리에서 포함할 항목 가져오기
  
  try {
    const query = `
      SELECT c.id, c.name, c.slug, COUNT(b.id) as post_count
      FROM categories c
      LEFT JOIN blog_posts b ON c.id = b.category_id
      GROUP BY c.id
      ORDER BY c.name
    `; // 카테고리 쿼리 설정
    const categories = db.prepare(query).all(); // 데이터베이스에서 카테고리 가져오기
    
    // 미카테고리 글 개수 계산
    if (include?.includes('uncategorized')) {
      // 미카테고리 글 개수 계산
      const uncategorizedQuery = `
        SELECT COUNT(*) as count
        FROM blog_posts
        WHERE category_id IS NULL OR category_id = 0
      `; // 미카테고리 쿼리 설정
      const uncategorizedCount = db.prepare(uncategorizedQuery).get().count; // 미카테고리 개수 가져오기
    
      // '미카테고리' 옵션 추가
      categories.unshift({
        id: 0,
        name: '미카테고리',
        slug: 'uncategorized',
        post_count: uncategorizedCount
      });
    }

    if (include?.includes('all')) {
      // 모든 카테고리 글 개수 계산
      const allQuery = `
        SELECT COUNT(*) as count
        FROM blog_posts
      `; // 모든 카테고리 쿼리 설정
      const allCount = db.prepare(allQuery).get().count; // 모든 카테고리 개수 가져오기

      // 모든 카테고리 옵션 추가
      categories.unshift({
        id: -1,
        name: '모든 카테고리',
        slug: 'all',
        post_count: allCount
      });
    }

    res.json(categories); // 카테고리 응답
  } catch (error) {
    console.error('Error fetching categories:', error); // 에러 로그
    res.status(500).json({ error: 'Internal server error' }); // 실패 응답
  }
});

/**
 * POST /api/categories
 * 새로운 카테고리를 추가합니다.
 * 
 * 입력 파라미터:
 * - name: 카테고리 이름
 * - slug: 카테고리 슬러그
 * 
 * 출력 값:
 * - 성공 여부 및 새로 생성된 카테고리 ID
 */
app.post('/api/categories', (req, res) => {
  const { name, slug } = req.body; // 요청 본문에서 데이터 가져오기
  const query = 'INSERT INTO categories (name, slug) VALUES (?, ?)'; // 쿼리 설정
  const params = [name, slug]; // 파라미터 설정
  logQuery(query, params); // 쿼리 로그
  try {
    const result = db.prepare(query).run(params); // 쿼리 실행
    res.json({ success: true, id: result.lastInsertRowid }); // 성공 응답
  } catch (error) {
    console.error('Error adding category:', error); // 에러 로그
    res.status(500).json({ error: 'Failed to add category' }); // 실패 응답
  }
});

/**
 * PUT /api/categories
 * 카테고리 목록을 업데이트합니다.
 * 
 * 입력 파라미터:
 * - categories: 카테고리 객체 배열 (각 객체는 id, name, slug 포함)
 * 
 * 출력 값:
 * - 성공 여부
 */
app.put('/api/categories', (req, res) => {
  const categories = req.body; // 요청 본문에서 카테고리 배열 가져오기
  const categoryIds = categories.map(cat => cat.id).filter(id => id !== undefined); // 카테고리 ID 배열 생성
  const updateQuery = 'UPDATE categories SET name = ?, slug = ? WHERE id = ?'; // 업데이트 쿼리 설정
  let deleteQuery = 'DELETE FROM categories WHERE id NOT IN (?)'; // 삭제 쿼리 설정
  let updatePostsQuery = 'UPDATE blog_posts SET category_id = 0 WHERE category_id NOT IN (?)'; // 포스트 카테고리 업데이트 쿼리 설정
  
  try {
    db.prepare('BEGIN').run(); // 트랜잭션 시작
    
    categories.forEach(category => {
      if (category.id) {
        const params = [category.name, category.slug, category.id]; // 파라미터 설정
        logQuery(updateQuery, params); // 쿼리 로그
        db.prepare(updateQuery).run(params); // 쿼리 실행
      } else {
        // 새 카테고리 추가
        const insertQuery = 'INSERT INTO categories (name, slug) VALUES (?, ?)'; // 삽입 쿼리 설정
        const params = [category.name, category.slug]; // 파라미터 설정
        logQuery(insertQuery, params); // 쿼리 로그
        const result = db.prepare(insertQuery).run(params); // 쿼리 실행
        categoryIds.push(result.lastInsertRowid); // 새 카테고리 ID 추가
      }
    });
    
    if (categoryIds.length > 0) {
      deleteQuery = `DELETE FROM categories WHERE id NOT IN (${categoryIds.join(',')})`; // 삭제 쿼리 업데이트
      logQuery(deleteQuery); // 쿼리 로그
      db.prepare(deleteQuery).run(); // 쿼리 실행
      
      // 삭제된 카테고리에 속한 글들을 미카테고리로 변경
      updatePostsQuery = `UPDATE blog_posts SET category_id = 0 WHERE category_id NOT IN (${categoryIds.join(',')})`; // 포스트 카테고리 업데이트 쿼리 업데이트
      logQuery(updatePostsQuery); // 쿼리 로그
      db.prepare(updatePostsQuery).run(); // 쿼리 실행
    }
    
    db.prepare('COMMIT').run(); // 트랜잭션 커밋
    res.json({ success: true }); // 성공 응답
  } catch (error) {
    db.prepare('ROLLBACK').run(); // 트랜잭션 롤백
    console.error('Error updating categories:', error); // 에러 로그
    res.status(500).json({ error: 'Failed to update categories' }); // 실패 응답
  }
});

/**
 * DELETE /api/categories/:id
 * 특정 카테고리를 삭제합니다.
 * 
 * 입력 파라미터:
 * - id: 삭제할 카테고리 ID
 * 
 * 출력 값:
 * - 성공 여부
 */
app.delete('/api/categories/:id', (req, res) => {
  const { id } = req.params; // URL 파라미터에서 ID 가져오기
  
  try {
    db.prepare('BEGIN').run(); // 트랜잭션 시작
    
    // 해당 카테고리의 글들을 미카테고리로 변경
    db.prepare('UPDATE blog_posts SET category_id = 0 WHERE category_id = ?').run(id);
    
    // 카테고리 삭제
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    
    db.prepare('COMMIT').run(); // 트랜잭션 커밋
    
    res.json({ success: true }); // 성공 응답
  } catch (error) {
    db.prepare('ROLLBACK').run(); // 트랜잭션 롤백
    console.error('Error deleting category:', error); // 에러 로그
    res.status(500).json({ error: 'Failed to delete category' }); // 실패 응답
  }
});

/**
 * GET /api/contact
 * 연락처 목록을 가져오거나 특정 연락처를 조회합니다.
 * 
 * 입력 파라미터:
 * - id: 연락처 ID (선택적)
 * - page: 페이지 번호 (기본값: 1)
 * - limit: 페이지당 연락처 수 (기본값: 10)
 * - searchType: 검색 타입 (author, title, content 중 하나)
 * - searchText: 검색 텍스트
 * 
 * 출력 값:
 * - 연락처 객체 또는 연락처 목록
 */
app.get('/api/contact', (req, res) => {
  const id = req.query.id; // 쿼리에서 ID 가져오기
  const { page = 1, limit = 10, searchType, searchText } = req.query; // 페이지, 제한, 검색 타입, 검색 텍스트 가져오기

  if (id && id !== -1) { // 상세 페이지, 수정 페이지
    const query = 'SELECT * FROM contact WHERE id = ?'; // 쿼리 설정
    const params = [id]; // 파라미터 설정
    logQuery(query, params); // 쿼리 로그
    const post = db.prepare(query).get(params); // 데이터베이스에서 포스트 가져오기
    if (post) {
      res.json(post); // 포스트 응답
    } else {
      res.status(404).json({ error: 'Contact not found' }); // 포스트 없음 응답
    }
  } else { // 목록 페이지
    const offset = (page - 1) * limit; // 오프셋 계산
    let query = 'SELECT * FROM contact'; // 기본 쿼리 설정
    let countQuery = 'SELECT COUNT(*) as total FROM contact'; // 총 개수 쿼리 설정
    let params = []; // 파라미터 배열 초기화

    if (searchText) { // 검색 텍스트가 있는 경우
      query += ' WHERE'; // WHERE 절 추가
      countQuery += ' WHERE'; // COUNT 쿼리에도 WHERE 절 추가
      if (searchType === 'author') {
        query += ' author LIKE ?'; // 저자 검색
        countQuery += ' author LIKE ?'; // 저자 검색
      } else if (searchType === 'title') {
        query += ' title LIKE ?'; // 제목 검색
        countQuery += ' title LIKE ?'; // 제목 검색
      } else if (searchType === 'content') {
        query += ' content LIKE ?'; // 내용 검색
        countQuery += ' content LIKE ?'; // 내용 검색
      }
      params.push(`%${searchText}%`); // 파라미터에 검색 텍스트 추가
    }

    query += ' ORDER BY id DESC LIMIT ? OFFSET ?'; // 정렬 및 제한 추가
    params.push(parseInt(limit), offset); // 페이지 제한 및 오프셋 추가

    logQuery(query, params); // 쿼리 로그
    logQuery(countQuery, params.slice(0, -2)); // 총 개수 쿼리 로그

    const posts = db.prepare(query).all(params); // 데이터베이스에서 포스트 목록 가져오기
    const totalCount = db.prepare(countQuery).get(params.slice(0, -2)); // 총 개수 가져오기

    res.json({ // 응답
      posts,
      total: totalCount.total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  }
});

/**
 * POST /api/contact
 * 새로운 연락처를 추가합니다.
 * 
 * 입력 파라미터:
 * - title: 연락처 제목
 * - content: 연락처 내용
 * 
 * 출력 값:
 * - 성공 여부 및 새로 생성된 연락처 ID
 */
app.post('/api/contact', (req, res) => {
  const { title, content } = req.body; // 요청 본문에서 데이터 가져오기
  const query = 'INSERT INTO contact (title, content) VALUES (?, ?)'; // 쿼리 설정
  const params = [title, content]; // 파라미터 설정
  logQuery(query, params); // 쿼리 로그
  try {
    const result = db.prepare(query).run(params); // 쿼리 실행
    res.status(201).json({ success: true, id: result.lastInsertRowid }); // 성공 응답
  } catch (error) {
    console.error('Error adding contact:', error); // 에러 로그
    res.status(500).json({ error: 'Failed to add contact' }); // 실패 응답
  }
});

/**
 * PUT /api/contact
 * 특정 연락처를 업데이트합니다.
 * 
 * 입력 파라미터:
 * - id: 업데이트할 연락처 ID
 * - title: 연락처 제목
 * - content: 연락처 내용
 * 
 * 출력 값:
 * - 성공 여부
 */
app.put('/api/contact', (req, res) => {
  const { id, title, content } = req.body; // 요청 본문에서 데이터 가져오기
  const query = 'UPDATE contact SET title = ?, content = ? WHERE id = ?'; // 쿼리 설정
  const params = [title, content, id]; // 파라미터 설정
  logQuery(query, params); // 쿼리 로그
  try {
    const result = db.prepare(query).run(params); // 쿼리 실행
    res.json({ success: true }); // 성공 응답
  } catch (error) {
    console.error('Error updating contact:', error); // 에러 로그
    res.status(500).json({ error: 'Failed to update contact' }); // 실패 응답
  }
});

/**
 * DELETE /api/contact
 * 특정 연락처를 삭제합니다.
 * 
 * 입력 파라미터:
 * - id: 삭제할 연락처 ID
 * 
 * 출력 값:
 * - 성공 여부
 */
app.delete('/api/contact', (req, res) => {
  const { id } = req.body; // 요청 본문에서 ID 가져오기
  const query = 'DELETE FROM contact WHERE id = ?'; // 쿼리 설정
  const params = [id]; // 파라미터 설정
  logQuery(query, params); // 쿼리 로그
  try {
    const result = db.prepare(query).run(params); // 쿼리 실행
    res.json({ success: true }); // 성공 응답
  } catch (error) {
    console.error('Error deleting contact:', error); // 에러 로그
    res.status(500).json({ error: 'Failed to delete contact' }); // 실패 응답
  }
});

/**
 * GET /api/adminboard
 * 관리자 게시판 포스트 목록을 가져오거나 특정 포스트를 조회합니다.
 * 
 * 입력 파라미터:
 * - id: 포스트 ID (선택적)
 * - page: 페이지 번호 (기본값: 1)
 * - limit: 페이지당 포스트 수 (기본값: 10)
 * - searchType: 검색 타입 (author, title, content 중 하나)
 * - searchText: 검색 텍스트
 * 
 * 출력 값:
 * - 포스트 객체 또는 포스트 목록
 */
app.get('/api/adminboard', (req, res) => {
  const id = req.query.id; // 쿼리에서 ID 가져오기
  const { page = 1, limit = 10, searchType, searchText } = req.query; // 페이지, 제한, 검색 타입, 검색 텍스트 가져오기

  if (id && id !== -1) { // 상세 페이지, 수정 페이지
    const query = 'SELECT * FROM adminboard WHERE id = ?'; // 쿼리 설정
    const params = [id]; // 파라미터 설정
    logQuery(query, params); // 쿼리 로그
    const post = db.prepare(query).get(params); // 데이터베이스에서 포스트 가져오기
    if (post) {
      res.json(post); // 포스트 응답
    } else {
      res.status(404).json({ error: 'Admin board post not found' }); // 포스트 없음 응답
    }
  } else { // 목록 페이지
    const offset = (page - 1) * limit; // 오프셋 계산
    let query = 'SELECT * FROM adminboard'; // 기본 쿼리 설정
    let countQuery = 'SELECT COUNT(*) as total FROM adminboard'; // 총 개수 쿼리 설정
    let params = []; // 파라미터 배열 초기화

    if (searchText) { // 검색 텍스트가 있는 경우
      query += ' WHERE'; // WHERE 절 추가
      countQuery += ' WHERE'; // COUNT 쿼리에도 WHERE 절 추가
      if (searchType === 'author') {
        query += ' author LIKE ?'; // 저자 검색
        countQuery += ' author LIKE ?'; // 저자 검색
      } else if (searchType === 'title') {
        query += ' title LIKE ?'; // 제목 검색
        countQuery += ' title LIKE ?'; // 제목 검색
      } else if (searchType === 'content') {
        query += ' content LIKE ?'; // 내용 검색
        countQuery += ' content LIKE ?'; // 내용 검색
      }
      params.push(`%${searchText}%`); // 파라미터에 검색 텍스트 추가
    }

    query += ' ORDER BY id DESC LIMIT ? OFFSET ?'; // 정렬 및 제한 추가
    params.push(parseInt(limit), offset); // 페이지 제한 및 오프셋 추가

    logQuery(query, params); // 쿼리 로그
    logQuery(countQuery, params.slice(0, -2)); // 총 개수 쿼리 로그

    const posts = db.prepare(query).all(params); // 데이터베이스에서 포스트 목록 가져오기
    const totalCount = db.prepare(countQuery).get(params.slice(0, -2)); // 총 개수 가져오기

    res.json({ // 응답
      posts,
      total: totalCount.total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  }
});

/**
 * POST /api/adminboard
 * 새로운 관리자 게시판 포스트를 추가합니다.
 * 
 * 입력 파라미터:
 * - title: 포스트 제목
 * - content: 포스트 내용
 * 
 * 출력 값:
 * - 성공 여부 및 새로 생성된 포스트 ID
 */
app.post('/api/adminboard', (req, res) => {
  const { title, content } = req.body; // 요청 본문에서 데이터 가져오기
  const query = 'INSERT INTO adminboard (title, content) VALUES (?, ?)'; // 쿼리 설정
  const params = [title, content]; // 파라미터 설정
  logQuery(query, params); // 쿼리 로그
  try {
    const result = db.prepare(query).run(params); // 쿼리 실행
    res.status(201).json({ success: true, id: result.lastInsertRowid }); // 성공 응답
  } catch (error) {
    console.error('Error adding admin board post:', error); // 에러 로그
    res.status(500).json({ error: 'Failed to add admin board post' }); // 실패 응답
  }
});

/**
 * PUT /api/adminboard
 * 특정 관리자 게시판 포스트를 업데이트합니다.
 * 
 * 입력 파라미터:
 * - id: 업데이트할 포스트 ID
 * - title: 포스트 제목
 * - content: 포스트 내용
 * 
 * 출력 값:
 * - 성공 여부
 */
app.put('/api/adminboard', (req, res) => {
  const { id, title, content } = req.body; // 요청 본문에서 데이터 가져오기
  const query = 'UPDATE adminboard SET title = ?, content = ? WHERE id = ?'; // 쿼리 설정
  const params = [title, content, id]; // 파라미터 설정
  logQuery(query, params); // 쿼리 로그
  try {
    const result = db.prepare(query).run(params); // 쿼리 실행
    res.json({ success: true }); // 성공 응답
  } catch (error) {
    console.error('Error updating admin board post:', error); // 에러 로그
    res.status(500).json({ error: 'Failed to update admin board post' }); // 실패 응답
  }
});

/**
 * DELETE /api/adminboard
 * 특정 관리자 게시판 포스트를 삭제합니다.
 * 
 * 입력 파라미터:
 * - id: 삭제할 포스트 ID
 * 
 * 출력 값:
 * - 성공 여부
 */
app.delete('/api/adminboard', (req, res) => {
  const { id } = req.body; // 요청 본문에서 ID 가져오기
  const query = 'DELETE FROM adminboard WHERE id = ?'; // 쿼리 설정
  const params = [id]; // 파라미터 설정
  logQuery(query, params); // 쿼리 로그
  try {
    const result = db.prepare(query).run(params); // 쿼리 실행
    res.json({ success: true }); // 성공 응답
  } catch (error) {
    console.error('Error deleting admin board post:', error); // 에러 로그
    res.status(500).json({ error: 'Failed to delete admin board post' }); // 실패 응답
  }
});

// 파일 업로드 API 엔드포인트
/**
 * POST /api/upload
 * 파일을 업로드합니다.
 * 
 * 입력 파라미터:
 * - file: 업로드할 파일
 * 
 * 출력 값:
 * - 성공 여부 및 업로드된 파일 URL
 */
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    res.json({ // 성공 응답
      success: true, 
      url: `/uploads/${req.file.filename}` // 업로드된 파일 URL
    });
  } else {
    res.status(400).json({ success: false, message: 'No file uploaded' }); // 실패 응답
  }
});

// 서버 시작
app.listen(port, () => {
  console.log(`Database server running on port ${port}`); // 서버 시작 로그
});