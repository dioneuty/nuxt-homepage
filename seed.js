import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()
const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')

  // 기존 데이터 삭제 (옵션)
  await prisma.blogPost.deleteMany({})
  await prisma.category.deleteMany({})
  await prisma.boardPost.deleteMany({})
  await prisma.image.deleteMany({})
  await prisma.contact.deleteMany({})
  await prisma.adminBoard.deleteMany({})
  await prisma.qnA.deleteMany({})
  // 다른 모델들도 필요에 따라 추가

  // Category 데이터 생성
  const categories = await prisma.category.createManyAndReturn({
    data: [
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
    ],
  })
  console.log('Categories created.')

  // BlogPost 데이터 생성
  await prisma.blogPost.createMany({
    data: [
      { title: '첫 번째 블로그 포스트', content: '이것은 첫 번째 블로그 포스트의 내용입니다.', categoryId: categories[0].id },
      { title: '두 번째 블로그 포스트', content: '이것은 두 번째 블로그 포스트의 내용입니다.', categoryId: categories[1].id },
      { title: '세 번째 블로그 포스트', content: '이것은 세 번째 블로그 포스트의 내용입니다.', categoryId: categories[2].id },
    ],
  })
  console.log('BlogPosts created.')

  // BoardPost 데이터 생성
  await prisma.boardPost.createMany({
    data: [
      { title: '첫 번째 게시글', content: '이것은 첫 번째 게시글의 내용입니다.', author: '홍길동' },
      { title: '두 번째 게시글', content: '이것은 두 번째 게시글의 내용입니다.', author: '김철수' },
    ],
  })
  console.log('BoardPosts created.')

  // Image 데이터 생성
  await prisma.image.createMany({
    data: [
      { url: '/images/image1.jpg', alt: '이미지 1' },
      { url: '/images/image2.jpg', alt: '이미지 2' },
    ],
  })
  console.log('Images created.')

  // Contact 데이터 생성
  await prisma.contact.createMany({
    data: [
      { author: '홍길동', title: '안녕하세요, 문의드립니다.', content: '안녕하세요, 문의드립니다.', email: 'hong@test.com' },
      { author: '김철수', title: '제품에 대한 질문이 있습니다.', content: '제품에 대한 질문이 있습니다.', email: 'kim@test.com' },
    ],
  })
  console.log('Contacts created.')

  // AdminBoard 데이터 생성
  await prisma.adminBoard.createMany({
    data: [
      { title: '첫 번째 관리자 게시글', content: '이것은 첫 번째 관리자 게시글의 내용입니다.' },
      { title: '두 번째 관리자 게시글', content: '이것은 두 번째 관리자 게시글의 내용입니다.' },
    ],
  })
  console.log('AdminBoards created.')

  // QnA 데이터 생성
  await prisma.qnA.createMany({
    data: [
      {
        questionTitle: '리모델링 견적 문의',
        questionContent: '20평대 아파트 전체 리모델링 견적이 궁금합니다.',
        author: '김철수',
        answerContent: '대략 3000만원에서 5000만원 정도의 예산이 필요합니다.',
        answerer: '홈닥터 관리자',
      },
      {
        questionTitle: '화장실 누수 문제',
        questionContent: '화장실에서 물이 새는데 어떻게 해결해야 할까요?',
        author: '이영희',
      },
    ],
  })
  console.log('QnAs created.')

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })