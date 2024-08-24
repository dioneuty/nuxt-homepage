import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const prisma = new PrismaClient()
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

export default defineEventHandler(async (event) => {
  const method = event.req.method
  const query = getQuery(event)

  // GET 요청 처리
  if (method === 'GET') {
    if (query.id) {
      if (query.action === 'comments') {
        console.log('comments')
        // 갤러리 항목의 댓글 목록 조회
        return await getGalleryItemComments(parseInt(query.id))
      } else {
        // 갤러리 상세 조회
        return await getGalleryItem(parseInt(query.id))
      }
    } else {
      // 갤러리 목록 조회
      return await getGalleryList()
    }
  }

  // POST 요청 처리
  if (method === 'POST') {
    const body = await readBody(event)
    if (query.action === 'comment') {
      // 댓글 추가
      return await addComment(body)
    } else {
      // 갤러리 항목 생성
      return await createGalleryItem(body)
    }
  }

  // PUT 요청 처리
  if (method === 'PUT') {
    const body = await readBody(event)
    if (query.action === 'comment') {
      // 댓글 수정
      return await updateComment(body)
    } else {
      // 갤러리 항목 수정
      return await updateGalleryItem(body)
    }
  }

  // DELETE 요청 처리
  if (method === 'DELETE') {
    if (query.action === 'comment') {
      // 댓글 삭제
      return await deleteComment(parseInt(query.id))
    } else {
      // 갤러리 항목 삭제
      return await deleteGalleryItem(parseInt(query.id))
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method Not Allowed'
  })
})

// 갤러리 목록 조회 함수
// 특정 갤러리 항목 id과 연계된 galleryComment 테이블에서 조회해서 카운트로 포함
async function getGalleryList() {
    return await prisma.galleryItem.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        _count: {
          select: { comments: true }
        },
        comments: {
          select: {
            id: true
          }
        }
      }
    })
  }

// 갤러리 상세 조회 함수
async function getGalleryItem(id) {
  const info = await prisma.galleryItem.findUnique({
    where: { id },
    include: {
      comment: { // 댓글 조회
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })
  console.log('info', info)
  return info
}

// 갤러리 항목 생성 함수
async function createGalleryItem(data) {
  return await prisma.galleryItem.create({
    data: {
      title: data.title,
      content: data.content, // imageUrl 대신 content 사용
      description: data.description,
      tags: data.tags
    }
  })
}

// 갤러리 항목 수정 함수
async function updateGalleryItem(data) {
  return await prisma.galleryItem.update({
    where: { id: parseInt(data.id) },
    data: {
      title: data.title,
      content: data.content, // imageUrl 대신 content 사용
      description: data.description,
      tags: data.tags
    }
  })
}

// 갤러리 항목 삭제 함수
async function deleteGalleryItem(id) {
  await prisma.$transaction([
    prisma.galleryComment.deleteMany({ where: { galleryItemId: id } }),
    prisma.galleryItem.delete({ where: { id } })
  ])
  // Supabase에서 관련 파일 삭제
  const { data, error } = await supabase
    .storage
    .from('gallery')
    .remove([`${id}/*`])
  if (error) {
    console.error('Supabase file deletion error:', error)
  }
  return { success: true }
}

// 댓글 추가 함수
async function addComment(data) {
  return await prisma.galleryComment.create({
    data: {
      content: data.content,
      author: data.author,
      authorId: data.authorId,
      galleryItemId: parseInt(data.galleryItemId)
    }
  })
}

// 댓글 수정 함수
async function updateComment(data) {
  return await prisma.galleryComment.update({
    where: { id: parseInt(data.id) },
    data: {
      content: data.content
    }
  })
}

// 댓글 삭제 함수
async function deleteComment(id) {
  await prisma.galleryComment.delete({ where: { id } })
  return { success: true }
}

// 갤러리 항목의 댓글 목록 조회 함수
async function getGalleryItemComments(id) {
  console.log('getGalleryItemComments', id)
  const comments = await prisma.galleryComment.findMany({
    where: { galleryItemId: id },
    orderBy: {
      createdAt: 'desc'
    }
  })
  console.log('getGalleryItemComments', comments)
  return comments
}