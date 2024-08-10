import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// .env 파일의 경로를 명시적으로 지정
dotenv.config({ path: join(__dirname, '..', '..', '.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

console.log('SUPABASE_URL:', supabaseUrl)
console.log('SUPABASE_KEY:', supabaseKey)

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL과 SUPABASE_KEY 환경 변수가 설정되어 있지 않습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function initDatabase() {
  // 테이블 생성
  const { error: categoriesError } = await supabase.rpc('create_categories_table')
  const { error: blogPostsError } = await supabase.rpc('create_blog_posts_table')
  const { error: boardPostsError } = await supabase.rpc('create_board_posts_table')
  const { error: imagesError } = await supabase.rpc('create_images_table')
  const { error: contactError } = await supabase.rpc('create_contact_table')
  const { error: adminboardError } = await supabase.rpc('create_adminboard_table')

  if (categoriesError || blogPostsError || boardPostsError || imagesError || contactError || adminboardError) {
    console.error('Error creating tables:', categoriesError || blogPostsError || boardPostsError || imagesError || contactError || adminboardError)
    return
  }

  // 카테고리 데이터 삽입
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
  ]

  const { error: categoryInsertError } = await supabase
    .from('categories')
    .insert(categories)

  if (categoryInsertError) {
    console.error('Error inserting categories:', categoryInsertError)
    return
  }

  // 블로그 포스트 데이터 삽입
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
  ]

  const { error: blogPostInsertError } = await supabase
    .from('blog_posts')
    .insert(blogPosts)

  if (blogPostInsertError) {
    console.error('Error inserting blog posts:', blogPostInsertError)
    return
  }

  // 게시판 포스트 데이터 삽입
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
  ]

  const { error: boardPostInsertError } = await supabase
    .from('board_posts')
    .insert(boardPosts)

  if (boardPostInsertError) {
    console.error('Error inserting board posts:', boardPostInsertError)
    return
  }

  // 이미지 데이터 삽입
  const images = [
    { url: '/images/image1.jpg', alt: '이미지 1' },
    { url: '/images/image2.jpg', alt: '이미지 2' },
  ]

  const { error: imageInsertError } = await supabase
    .from('images')
    .insert(images)

  if (imageInsertError) {
    console.error('Error inserting images:', imageInsertError)
    return
  }

  // contact_messages 샘플 데이터 삽입
  const contactMessages = [
    { name: '홍길동', email: 'hong@example.com', message: '안녕하세요, 문의드립니다.' },
    { name: '김철수', email: 'kim@example.com', message: '제품에 대한 질문이 있습니다.' },
  ]

  const { error: contactInsertError } = await supabase
    .from('contact')
    .insert(contactMessages)

  if (contactInsertError) {
    console.error('Error inserting contact messages:', contactInsertError)
    return
  }

  // admin_board 샘플 데이터 삽입
  const adminBoardPosts = [
    { title: '첫 번째 관리자 게시글', content: '이것은 첫 번째 관리자 게시글의 내용입니다.' },
    { title: '두 번째 관리자 게시글', content: '이것은 두 번째 관리자 게시글의 내용입니다.' },
  ]

  const { error: adminBoardInsertError } = await supabase
    .from('adminboard')
    .insert(adminBoardPosts)

  if (adminBoardInsertError) {
    console.error('Error inserting admin board posts:', adminBoardInsertError)
    return
  }

  console.log('Database initialized with sample data')
}

initDatabase()