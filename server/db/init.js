import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'database.sqlite'));

// 기존 데이터 삭제
db.exec('DROP TABLE IF EXISTS blog_posts');
db.exec('DROP TABLE IF EXISTS board_posts');
db.exec('DROP TABLE IF EXISTS images');
db.exec('DROP TABLE IF EXISTS categories');
db.exec('DROP TABLE IF EXISTS contact');
db.exec('DROP TABLE IF EXISTS adminboard');

// 테이블 생성
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    slug TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    category_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS board_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    author TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT,
    alt TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS contact (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS adminboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// 카테고리 데이터
const categories = [
  { name: '부분 수리', slug: 'partial-repair' },
  { name: '전장 설치', slug: 'electrical-installation' },
  { name: '욕실 수리', slug: 'bathroom-repair' },
  { name: '주방 수리', slug: 'kitchen-repair' },
  { name: '도배 및 페인트', slug: 'wallpaper-and-paint' },
  { name: '바닥재 시공', slug: 'flooring' },
  { name: '창호 교체', slug: 'window-replacement' },
  { name: '단열 공사', slug: 'insulation' },
  { name: '누수 수리', slug: 'leak-repair' },
  { name: '전체 리모델링', slug: 'full-remodeling' }
];

// 카테고리 삽입 쿼리 준비
const insertCategory = db.prepare('INSERT INTO categories (name, slug) VALUES (?, ?)');

// 카테고리 데이터 삽입
categories.forEach(category => {
  insertCategory.run(category.name, category.slug);
});

// 블로그 포스트 데이터 (카테고리 ID 포함)
const blogPosts = [
  { title: '첫 번째 블로그 포스트', content: '이것은 첫 번째 블로그 포스트의 내용입니다.', category_id: 2 },
  { title: '두 번째 블로그 포스트', content: '이것은 두 번째 블로그 포스트의 내용입니다.', category_id: 3 },
  { title: '세 번째 블로그 포스트', content: '이것은 세 번째 블로그 포스트의 내용입니다.', category_id: 4 },
  { title: '네 번째 블로그 포스트', content: '이것은 네 번째 블로그 포스트의 내용입니다.', category_id: 5 },
  { title: '다섯 번째 블로그 포스트', content: '이것은 다섯 번째 블로그 포스트의 내용입니다.', category_id: 6 },
  { title: '여섯 번째 블로그 포스트', content: '이것은 여섯 번째 블로그 포스트의 내용입니다.', category_id: 7 },
  { title: '일곱 번째 블로그 포스트', content: '이것은 일곱 번째 블로그 포스트의 내용입니다.', category_id: 8 },
  { title: '여덟 번째 블로그 포스트', content: '이것은 여덟 번째 블로그 포스트의 내용입니다.', category_id: 9 },
  { title: '아홉 번째 블로그 포스트', content: '이것은 아홉 번째 블로그 포스트의 내용입니다.', category_id: 10 },
  { title: '열 번째 블로그 포스트', content: '이것은 열 번째 블로그 포스트의 내용입니다.', category_id: 2 },
  { title: '열한 번째 블로그 포스트', content: '이것은 열한 번째 블로그 포스트의 내용입니다.', category_id: 3 },
  { title: '열두 번째 블로그 포스트', content: '이것은 열두 번째 블로그 포스트의 내용입니다.', category_id: 4 },
  { title: '열세 번째 블로그 포스트', content: '이것은 열세 번째 블로그 포스트의 내용입니다.', category_id: 5 },
  { title: '열네 번째 블로그 포스트', content: '이것은 열네 번째 블로그 포스트의 내용입니다.', category_id: 6 },
  { title: '열다섯 번째 블로그 포스트', content: '이것은 열다섯 번째 블로그 포스트의 내용입니다.', category_id: 7 },
  { title: '열여섯 번째 블로그 포스트', content: '이것은 열여섯 번째 블로그 포스트의 내용입니다.', category_id: 8 },
  { title: '열일곱 번째 블로그 포스트', content: '이것은 열일곱 번째 블로그 포스트의 내용입니다.', category_id: 9 },
  { title: '열여덟 번째 블로그 포스트', content: '이것은 열여덟 번째 블로그 포스트의 내용입니다.', category_id: 10 },
  { title: '열아홉 번째 블로그 포스트', content: '이것은 열아홉 번째 블로그 포스트의 내용입니다.', category_id: 2 },
  { title: '스무 번째 블로그 포스트', content: '이것은 스무 번째 블로그 포스트의 내용입니다.', category_id: 3 },
];

// 블로그 포스트 삽입 쿼리 수정
const insertBlogPost = db.prepare('INSERT INTO blog_posts (title, content, category_id) VALUES (?, ?, ?)');

// 블로그 포스트 데이터 삽입 (카테고리 ID 포함)
blogPosts.forEach(post => insertBlogPost.run(post.title, post.content, post.category_id));

// 게시판 포스트 데이터
const boardPosts = [
  { title: '첫 번째 게시글', content: '첫 번째 게시글 내용입니다.', author: '홍길동' },
  { title: '두 번째 게시글', content: '두 번째 게시글 내용입니다.', author: '김철수' },
  { title: '세 번째 게시글', content: '세 번째 게시글 내용입니다.', author: '이영희' },
  { title: '네 번째 게시글', content: '네 번째 게시글 내용입니다.', author: '박민수' },
  { title: '다섯 번째 게시글', content: '다섯 번째 게시글 내용입니다.', author: '정지원' },
  { title: '여섯 번째 게시글', content: '여섯 번째 게시글 내용입니다.', author: '최유진' },
  { title: '일곱 번째 게시글', content: '일곱 번째 게시글 내용입니다.', author: '강민재' },
  { title: '여덟 번째 게시글', content: '여덟 번째 게시글 내용입니다.', author: '윤서연' },
  { title: '아홉 번째 게시글', content: '아홉 번째 게시글 내용입니다.', author: '임재현' },
  { title: '열 번째 게시글', content: '열 번째 게시글 내용입니다.', author: '송지은' },
  { title: '열한 번째 게시글', content: '열한 번째 게시글 내용입니다.', author: '오현우' },
  { title: '열두 번째 게시글', content: '열두 번째 게시글 내용입니다.', author: '한소희' },
  { title: '열세 번째 게시글', content: '열세 번째 게시글 내용입니다.', author: '류준호' },
  { title: '열네 번째 게시글', content: '열네 번째 게시글 내용입니다.', author: '남지현' },
  { title: '열다섯 번째 게시글', content: '열다섯 번째 게시글 내용입니다.', author: '백승훈' },
  { title: '열여섯 번째 게시글', content: '열여섯 번째 게시글 내용입니다.', author: '조은서' },
  { title: '열일곱 번째 게시글', content: '열일곱 번째 게시글 내용입니다.', author: '권도윤' },
  { title: '열여덟 번째 게시글', content: '열여덟 번째 게시글 내용입니다.', author: '신예진' },
  { title: '열아홉 번째 게시글', content: '열아홉 번째 게시글 내용입니다.', author: '장현석' },
  { title: '스무 번째 게시글', content: '스무 번째 게시글 내용입니다.', author: '김서영' },
];

const images = [
  { url: '/images/image1.jpg', alt: '이미지 1' },
  { url: '/images/image2.jpg', alt: '이미지 2' },
];

// 카테고리 데이터 삽입
const insertBoardPost = db.prepare('INSERT INTO board_posts (title, content, author) VALUES (?, ?, ?)');
const insertImage = db.prepare('INSERT INTO images (url, alt) VALUES (?, ?)');

// 게시판 포스트 데이터 삽입
boardPosts.forEach(post => insertBoardPost.run(post.title, post.content, post.author));
// 이미지 데이터 삽입
images.forEach(image => insertImage.run(image.url, image.alt));


// contact_messages 샘플 데이터 삽입
const contactMessages = [
  { name: '홍길동', email: 'hong@example.com', message: '안녕하세요, 문의드립니다.' },
  { name: '김철수', email: 'kim@example.com', message: '제품에 대한 질문이 있습니다.' },
];

// contact_messages 데이터 삽입 쿼리 준비
const insertContactMessage = db.prepare('INSERT INTO contact (name, email, message) VALUES (?, ?, ?)');

// contact_messages 데이터 삽입
contactMessages.forEach(msg => {
  insertContactMessage.run(msg.name, msg.email, msg.message);
});

// admin_board 샘플 데이터 삽입
const adminBoardPosts = [
  { title: '첫 번째 관리자 게시글', content: '이것은 첫 번째 관리자 게시글의 내용입니다.' },
  { title: '두 번째 관리자 게시글', content: '이것은 두 번째 관리자 게시글의 내용입니다.' },
];

// admin_board 데이터 삽입 쿼리 준비
const insertAdminBoardPost = db.prepare('INSERT INTO adminboard (title, content) VALUES (?, ?)');

// admin_board 데이터 삽입
adminBoardPosts.forEach(post => {
  insertAdminBoardPost.run(post.title, post.content);
});

console.log('Database initialized with sample data');
db.close();