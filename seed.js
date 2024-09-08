import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedDatabase() {
  const tables = ['Category', 'BlogPost', 'BoardPost', 'Image', 'Contact', 'AdminBoard', 'QnA', 'Menu']

  for (const table of tables) {
    const { count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })

    // if (count === 0) {
      console.log(`${table} 테이블이 비어있습니다. 샘플 데이터를 삽입합니다.`)
      await insertSampleData(table)
    // } else {
      // console.log(`${table} 테이블에 이미 데이터가 있습니다. 샘플 데이터를 삽입하지 않습니다.`)
    // }
  }
}

async function insertSampleData(table) {
  let sampleData
  let result

  switch (table) {
    case 'Menu':
      sampleData = [
        { name: '홈', path: '/', children: [] },
        { name: '블로그', path: '/blog', children: [] },
        { 
          name: '소개', 
          path: null,
          children: [
            { name: '개인소개', path: '/about' },
            { name: '서비스', path: '/services' }
          ]
        },
        { 
          name: '게시판', 
          path: null,
          children: [
            { name: '자유게시판', path: '/board' },
            { name: '질문과답변', path: '/qna' },
            { name: '유머게시판', path: '/humor' }
          ]
        },
        { name: '문의', path: '/contact', children: [] },
        { name: '갤러리', path: '/gallery', children: [] },
        { name: '위키', path: '/wiki', children: [] },
        { name: '관련 사이트', path: '/related-sites', children: [] },
        { name: '종합 검색', path: '/search', children: [] },
        { name: '아웃라이너', path: '/outliner', children: [] },
        { 
          name: '관리자', 
          path: null,
          children: [
            { name: '관리자용 문의 게시판', path: '/contactboard' },
            { name: '관리자용 게시판', path: '/adminboard' },
            { name: '관리자용 갤러리', path: '/admingallery' }
          ],
          adminOnly: true
        },
        { name: 'AI 채팅', path: '/ai-chat', children: [] }
      ]
      break
    case 'Category':
      sampleData = [
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
      break
    case 'BlogPost':
      sampleData = [
        { title: '첫 번째 블로그 포스트', content: '이것은 첫 번째 블로그 포스트의 내용입니다.', categoryId: 1 },
        { title: '두 번째 블로그 포스트', content: '이것은 두 번째 블로그 포스트의 내용입니다.', categoryId: 2 },
        { title: '세 번째 블로그 포스트', content: '이것은 세 번째 블로그 포스트의 내용입니다.', categoryId: 3 },
        { title: '네 번째 블로그 포스트', content: '이것은 네 번째 블로그 포스트의 내용입니다.', categoryId: 1 },
        { title: '다섯 번째 블로그 포스트', content: '이것은 다섯 번째 블로그 포스트의 내용입니다.', categoryId: 2 }
      ]
      break
    case 'BoardPost':
      sampleData = [
        { title: '첫 번째 게시글', content: '이것은 첫 번째 게시글의 내용입니다.', author: '홍길동' },
        { title: '두 번째 게시글', content: '이것은 두 번째 게시글의 내용입니다.', author: '김철수' },
        { title: '세 번째 게시글', content: '이것은 세 번째 게시글의 내용입니다.', author: '이순신' },
        { title: '네 번째 게시글', content: '이것은 네 번째 게시글의 내용입니다.', author: '홍길동' },
        { title: '다섯 번째 게시글', content: '이것은 다섯 번째 게시글의 내용입니다.', author: '김철수' }
      ]
      break
    case 'Image':
      sampleData = [
        { url: '/images/image1.jpg', alt: '이미지 1' },
        { url: '/images/image2.jpg', alt: '이미지 2' }
      ]
      break
    case 'Contact':
      sampleData = [
        { author: '홍길동', title: '안녕하세요, 문의드립니다.', content: '안녕하세요, 문의드립니다.' },
        { author: '김철수', title: '제품에 대한 질문이 있습니다.', content: '제품에 대한 질문이 있습니다.' }
      ]
      break
    case 'AdminBoard':
      sampleData = [
        { title: '첫 번째 관리자 게시글', content: '이것은 첫 번째 관리자 게시글의 내용입니다.' },
        { title: '두 번째 관리자 게시글', content: '이것은 두 번째 관리자 게시글의 내용입니다.' }
      ]
      break
    case 'QnA':
      sampleData = [
        {
          questionTitle: '리모델링 견적 문의',
          questionContent: '20평대 아파트 전체 리모델링 견적이 궁금합니다. 어느 정도 예산이 필요할까요?',
          author: '김철수',
          answerContent: '20평대 아파트 전체 리모델링의 경우, 대략 3000만원에서 5000만원 정도의 예산이 필요합니다. 하지만 정확한 견적은 현장 방문 후 상담을 통해 결정됩니다.',
          answerer: '홈닥터 관리자'
        },
        {
          questionTitle: '화장실 누수 문제',
          questionContent: '화장실에서 물이 새는데 어떻게 해결해야 할까요?',
          author: '이영희',
          answerContent: '화장실 누수의 원인은 다양할 수 있습니다. 배관 문제, 실리콘 처리 불량 등이 주요 원인입니다. 정확한 진단을 위해 전문가의 현장 방문이 필요합니다.',
          answerer: '홈닥터 기술팀'
        },
        {
          questionTitle: '도배 비용 문의',
          questionContent: '방 두 개 도배 비용이 얼마나 들까요?',
          author: '박지성',
          answerContent: '방 크기와 사용하는 벽지의 종류에 따라 비용이 달라집니다. 일반적으로 방 두 개 기준으로 50만원에서 100만원 사이입니다. 정확한 견적은 현장 확인 후 안내 드리겠습니다.',
          answerer: '홈닥터 견적팀'
        },
        {
          questionTitle: '전기 콘센트 추가 설치',
          questionContent: '거실에 콘센트를 추가로 설치하고 싶은데 가능한가요?',
          author: '최동욱',
          answerContent: null,
          answerer: null
        },
        {
          questionTitle: '주방 싱크대 교체',
          questionContent: '오래된 싱크대를 새것으로 바꾸고 싶습니다. 어떤 과정으로 진행되나요?',
          author: '정수정',
          answerContent: null,
          answerer: null
        }
      ]
      break
  }

  result = await supabase
    .from(table)
    .insert(sampleData)
    .select()

  if (result.error) {
    console.error(`Error inserting ${table} data:`, result.error)
    return
  }

  console.log(`${table} data inserted:`, result.data)
}

seedDatabase()
  .catch(console.error)
  .finally(() => {
    console.log('Seeding completed')
    process.exit(0)
  })