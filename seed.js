import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'

dotenv.config()
const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')

  // 기존 데이터 삭제 (옵션)
  await prisma.user.deleteMany({})
  await prisma.blogPost.deleteMany({})
  await prisma.category.deleteMany({})
  await prisma.boardPost.deleteMany({})
  await prisma.image.deleteMany({})
  await prisma.contact.deleteMany({})
  await prisma.adminBoard.deleteMany({})
  await prisma.qnA.deleteMany({})
  await prisma.menu.deleteMany({})
  // 다른 모델들도 필요에 따라 추가

  // User 데이터 생성 (admin)
  const hashedPassword = await bcrypt.hash('15234', 10)
  await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })
  console.log('Admin user created.')

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

  // Menu 데이터 생성
  console.log('Creating menus...');
  const menuData = [
    { name: '홈', path: '/', order: 0 },
    { name: '블로그', path: '/blog', order: 1 },
    { 
      name: '소개',
      order: 2,
      children: [
        { name: '개인소개', path: '/about', order: 0 },
        { name: '서비스', path: '/services', order: 1 }
      ],
    },
    { 
      name: '게시판',
      order: 3,
      children: [
        { name: '자유게시판', path: '/board', order: 0 },
        { name: '질문과답변', path: '/qna', order: 1 },
        { name: '유머게시판', path: '/humor', order: 2 },
        { name: '방명록', path: '/guestbook', order: 3 }
      ],
    },
    { name: '문의', path: '/contact', order: 4 },
    { name: '갤러리', path: '/gallery', order: 5 },
    { name: '위키', path: '/wiki', order: 6 },
    { name: '관련 사이트', path: '/related-sites', order: 7 },
    { name: '종합 검색', path: '/search', order: 8 },
    { name: '아웃라이너', path: '/outliner', order: 9 },
    { 
      name: '외국어 학습',
      order: 10, 
      children: [
        { name: '영어', path: '/english', order: 0 },
        { name: '일본어', path: '/japanese', order: 1 }
      ],
    },
    { 
      name: '관리자',
      order: 11,
      role: 'admin',
      children: [
        { name: '관리자용 문의 게시판', path: '/contactboard', order: 0, role: 'admin' },
        { name: '관리자용 게시판', path: '/adminboard', order: 1, role: 'admin' },
        { name: '관리자용 갤러리', path: '/admingallery', order: 2, role: 'admin' },
        { name: '메뉴 관리', path: '/adminpage/menus', order: 3, role: 'admin' },
      ],
    },
    { name: 'AI 채팅', path: '/ai-chat', order: 12 },
    { name: '유튜브 갤러리', path: '/youtube-gallery', order: 13 }
  ];

  for (const menu of menuData) {
    const parent = await prisma.menu.create({
      data: {
        name: menu.name,
        path: menu.path,
        order: menu.order,
        role: menu.role || 'public',
      }
    });

    if (menu.children) {
      for (const childMenu of menu.children) {
        await prisma.menu.create({
          data: {
            name: childMenu.name,
            path: childMenu.path,
            order: childMenu.order,
            role: childMenu.role || 'public',
            parentId: parent.id,
          }
        });
      }
    }
  }
  console.log('Menus created.');

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