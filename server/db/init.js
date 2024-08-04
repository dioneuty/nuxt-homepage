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

// 테이블 생성
db.exec(`
  CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS board_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT,
    alt TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// 데이터 삽입
const blogPosts = [
  { title: '첫 번째 블로그 포스트', content: '이것은 첫 번째 블로그 포스트의 내용입니다.' },
  { title: '두 번째 블로그 포스트', content: '이것은 두 번째 블로그 포스트의 내용입니다.' },
  // ... 더 많은 데이터
];

const boardPosts = [
  { title: '첫 번째 게시글', content: '이것은 첫 번째 게시글의 내용입니다.' },
  { title: '두 번째 게시글', content: '이것은 두 번째 게시글의 내용입니다.' },
  // ... 더 많은 데이터
];

const images = [
  { url: '/images/image1.jpg', alt: '이미지 1' },
  { url: '/images/image2.jpg', alt: '이미지 2' },
  // ... 더 많은 데이터
];

const insertBlogPost = db.prepare('INSERT INTO blog_posts (title, content) VALUES (?, ?)');
const insertBoardPost = db.prepare('INSERT INTO board_posts (title, content) VALUES (?, ?)');
const insertImage = db.prepare('INSERT INTO images (url, alt) VALUES (?, ?)');

blogPosts.forEach(post => insertBlogPost.run(post.title, post.content));
boardPosts.forEach(post => insertBoardPost.run(post.title, post.content));
images.forEach(image => insertImage.run(image.url, image.alt));

console.log('Database initialized with sample data');
db.close();