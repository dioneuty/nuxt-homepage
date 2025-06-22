import prisma from '~/server/utils/prisma'
import { createClient } from '@supabase/supabase-js'
import { handleApiError } from '~/server/utils/apiErrorHandlers'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

export default defineEventHandler(async (event) => {
  const method = event.req.method
  const query = getQuery(event)

  try {
    // GET 요청 처리
    if (method === 'GET') {
      if (query.id) {
        // 관리자 갤러리 상세 조회
        const item = await getAdminGalleryItem(parseInt(query.id))
        return item || handleApiError(event, 404, '관리자 갤러리 항목을 찾을 수 없습니다')
      } else {
        // 관리자 갤러리 목록 조회
        return await getAdminGalleryList()
      }
    }

    // POST 요청 처리
    if (method === 'POST') {
      const body = await readBody(event)
      // 관리자 갤러리 항목 생성
      return await createAdminGalleryItem(body)
    }

    // PUT 요청 처리
    if (method === 'PUT') {
      const body = await readBody(event)
      // 관리자 갤러리 항목 수정
      return await updateAdminGalleryItem(body)
    }

    // DELETE 요청 처리
    if (method === 'DELETE') {
      // 관리자 갤러리 항목 삭제
      return await deleteAdminGalleryItem(parseInt(query.id))
    }

    handleApiError(event, 405, 'Method Not Allowed')

  } catch (error) {
    handleApiError(event, 500, '관리자 갤러리 처리 중 오류 발생', error)
  }
})

// 관리자 갤러리 목록 조회 함수
async function getAdminGalleryList() {
  try {
    return await prisma.adminGalleryItem.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
  } catch (error) {
    throw new Error('관리자 갤러리 목록 조회 실패')
  }
}

// 관리자 갤러리 상세 조회 함수
async function getAdminGalleryItem(id) {
  try {
    return await prisma.adminGalleryItem.findUnique({
      where: { id }
    })
  } catch (error) {
    throw new Error('관리자 갤러리 상세 조회 실패')
  }
}

// 관리자 갤러리 항목 생성 함수
async function createAdminGalleryItem(data) {
  try {
    return await prisma.adminGalleryItem.create({
      data: {
        title: data.title,
        content: data.content,
        description: data.description,
        tags: data.tags
      }
    })
  } catch (error) {
    throw new Error('관리자 갤러리 항목 생성 실패')
  }
}

// 관리자 갤러리 항목 수정 함수
async function updateAdminGalleryItem(data) {
  try {
    return await prisma.adminGalleryItem.update({
      where: { id: parseInt(data.id) },
      data: {
        title: data.title,
        content: data.content,
        description: data.description,
        tags: data.tags
      }
    })
  } catch (error) {
    throw new Error('관리자 갤러리 항목 수정 실패')
  }
}

// 관리자 갤러리 항목 삭제 함수
async function deleteAdminGalleryItem(id) {
  try {
    await prisma.adminGalleryItem.delete({ where: { id } })
    
    // Supabase에서 관련 파일 삭제
    const { data, error } = await supabase
      .storage
      .from('adminGalleryItem')
      .remove([`${id}/*`])
    if (error) {
      console.error('Supabase file deletion error:', error)
    }
    return { success: true }
  } catch (error) {
    throw new Error('관리자 갤러리 항목 삭제 실패')
  }
}