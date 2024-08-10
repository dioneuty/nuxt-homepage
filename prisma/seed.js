import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedDatabase() {
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

  const { data: categoryData, error: categoryError } = await supabase
    .from('Category')
    .insert(categories)
    .select()

  if (categoryError) {
    console.error('Error inserting categories:', categoryError)
    return
  }

  console.log('Categories inserted:', categoryData)

  // 블로그 포스트 데이터 삽입
  const blogPosts = [
    { title: '첫 번째 블로그 포스트', content: '이것은 첫 번째 블로그 포스트의 내용입니다.', categoryId: categoryData[0].id },
    { title: '두 번째 블로그 포스트', content: '이것은 두 번째 블로그 포스트의 내용입니다.', categoryId: categoryData[1].id },
    { title: '세 번째 블로그 포스트', content: '이것은 세 번째 블로그 포스트의 내용입니다.', categoryId: categoryData[2].id },
    { title: '네 번째 블로그 포스트', content: '이것은 네 번째 블로그 포스트의 내용입니다.', categoryId: categoryData[0].id },
    { title: '다섯 번째 블로그 포스트', content: '이것은 다섯 번째 블로그 포스트의 내용입니다.', categoryId: categoryData[1].id },
  ]

  const { data: blogPostData, error: blogPostError } = await supabase
    .from('BlogPost')
    .insert(blogPosts)
    .select()

  if (blogPostError) {
    console.error('Error inserting blog posts:', blogPostError)
    return
  }

  console.log('Blog posts inserted:', blogPostData)

  // 게시판 포스트 데이터 삽입
  const boardPosts = [
    { title: '첫 번째 게시글', content: '이것은 첫 번째 게시글의 내용입니다.', author: '홍길동' },
    { title: '두 번째 게시글', content: '이것은 두 번째 게시글의 내용입니다.', author: '김철수' },
    { title: '세 번째 게시글', content: '이것은 세 번째 게시글의 내용입니다.', author: '이순신' },
    { title: '네 번째 게시글', content: '이것은 네 번째 게시글의 내용입니다.', author: '홍길동' },
    { title: '다섯 번째 게시글', content: '이것은 다섯 번째 게시글의 내용입니다.', author: '김철수' },
  ]

  const { data: boardPostData, error: boardPostError } = await supabase
    .from('BoardPost')
    .insert(boardPosts)
    .select()

  if (boardPostError) {
    console.error('Error inserting board posts:', boardPostError)
    return
  }

  console.log('Board posts inserted:', boardPostData)

  // 이미지 데이터 삽입
  const images = [
    { url: '/images/image1.jpg', alt: '이미지 1' },
    { url: '/images/image2.jpg', alt: '이미지 2' },
  ]

  const { data: imageData, error: imageError } = await supabase
    .from('Image')
    .insert(images)
    .select()

  if (imageError) {
    console.error('Error inserting images:', imageError)
    return
  }

  console.log('Images inserted:', imageData)

  // 연락처 데이터 삽입
  const contacts = [
    { name: '홍길동', email: 'hong@example.com', message: '안녕하세요, 문의드립니다.' },
    { name: '김철수', email: 'kim@example.com', message: '제품에 대한 질문이 있습니다.' },
  ]

  const { data: contactData, error: contactError } = await supabase
    .from('Contact')
    .insert(contacts)
    .select()

  if (contactError) {
    console.error('Error inserting contacts:', contactError)
    return
  }

  console.log('Contacts inserted:', contactData)

  // 관리자 게시판 데이터 삽입
  const adminBoardPosts = [
    { title: '첫 번째 관리자 게시글', content: '이것은 첫 번째 관리자 게시글의 내용입니다.' },
    { title: '두 번째 관리자 게시글', content: '이것은 두 번째 관리자 게시글의 내용입니다.' },
  ]

  const { data: adminBoardData, error: adminBoardError } = await supabase
    .from('AdminBoard')
    .insert(adminBoardPosts)
    .select()

  if (adminBoardError) {
    console.error('Error inserting admin board posts:', adminBoardError)
    return
  }

  console.log('Admin board posts inserted:', adminBoardData)
}

seedDatabase()
  .catch(console.error)
  .finally(() => {
    console.log('Seeding completed')
    process.exit(0)
  })