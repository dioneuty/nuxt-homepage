import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'database.sqlite'));

// 기존의 데이터 삭제
db.exec('DROP TABLE IF EXISTS blog_posts');
db.exec('DROP TABLE IF EXISTS board_posts');
db.exec('DROP TABLE IF EXISTS images');
db.exec('DROP TABLE IF EXISTS categories');

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
    category_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT,
    alt TEXT,
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
];

// 블로그 포스트 삽입 쿼리 수정
const insertBlogPost = db.prepare('INSERT INTO blog_posts (title, content, category_id) VALUES (?, ?, ?)');

// 블로그 포스트 데이터 삽입 (카테고리 ID 포함)
blogPosts.forEach(post => insertBlogPost.run(post.title, post.content, post.category_id));

const boardPosts = [
  { title: '첫 번째 게시글', content: '이것은 첫 번째 게시글의 내용입니다.' },
  { title: '두 번째 게시글', content: '이것은 두 번째 게시글의 내용입니다.' },
];

const images = [
  { url: '/images/image1.jpg', alt: '이미지 1' },
  { url: '/images/image2.jpg', alt: '이미지 2' },
];

const insertBoardPost = db.prepare('INSERT INTO board_posts (title, content) VALUES (?, ?)');
const insertImage = db.prepare('INSERT INTO images (url, alt) VALUES (?, ?)');

boardPosts.forEach(post => insertBoardPost.run(post.title, post.content));
images.forEach(image => insertImage.run(image.url, image.alt));

console.log('Database initialized with sample data');
db.close();