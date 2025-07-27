import prisma from '~/server/utils/prisma'
import { createClient } from '@supabase/supabase-js'
import { handleApiError } from '~/server/utils/apiErrorHandlers'

/**
 * @file 갤러리 API
 * @description 갤러리 항목 (이미지/콘텐츠) 및 해당 댓글에 대한 CRUD (생성, 조회, 업데이트, 삭제) 작업을 처리합니다.
 *              Supabase Storage와 연동하여 파일 삭제 기능도 제공합니다.
 */
export default defineEventHandler(async (event) => {
  const method = event.req.method
  const query = getQuery(event)

  // GET 요청 처리: 갤러리 목록, 특정 갤러리 항목 또는 댓글 목록을 조회합니다.
  if (method === 'GET') {
    try {
      // 'id' 쿼리 파라미터가 제공된 경우 (특정 갤러리 항목 조회 요청)
      if (query.id) {
        // 'action' 쿼리 파라미터가 'comments'인 경우, 특정 갤러리 항목의 댓글 목록을 조회합니다.
        if (query.action === 'comments') {
          // Fetching comments
          return await getGalleryItemComments(parseInt(query.id)) // 댓글 조회 함수 호출
        } else if (query.imageOnly === 'true') {
          // 이미지만 요청하는 경우 (성능 최적화)
          return await getGalleryItemImage(parseInt(query.id))
        } else {
          // 'action'이 없거나 'comments'가 아닌 경우, 특정 갤러리 항목의 상세 정보를 조회합니다.
          return await getGalleryItem(parseInt(query.id)) // 갤러리 항목 상세 조회 함수 호출
        }
      } else {
        // 썸네일 모드 또는 전체 목록 조회
        if (query.thumbnails === 'true') {
          return await getGalleryThumbnails(query)
        } else {
          return await getGalleryList() // 갤러리 목록 조회 함수 호출
        }
      }
    } catch (error) {
      handleApiError(event, 500, '갤러리 조회 중 오류가 발생했습니다.', error);
    }
  }

  // POST 요청 처리: 새로운 갤러리 항목을 생성하거나 기존 갤러리 항목에 댓글을 추가합니다.
  if (method === 'POST') {
    try {
      const body = await readBody(event) // 요청 본문 데이터를 읽어옵니다.
      // 'action' 쿼리 파라미터가 'comment'인 경우, 댓글을 추가합니다.
      if (query.action === 'comment') {
        return await addComment(body) // 댓글 추가 함수 호출
      } else {
        // 'action'이 없거나 'comment'가 아닌 경우, 새로운 갤러리 항목을 생성합니다.
        return await createGalleryItem(body) // 갤러리 항목 생성 함수 호출
      }
    } catch (error) {
      handleApiError(error, '갤러리 생성/댓글 추가 중 오류', 500);
    }
  }

  // PUT 요청 처리: 갤러리 항목 또는 댓글을 수정합니다.
  if (method === 'PUT') {
    try {
      const body = await readBody(event) // 요청 본문 데이터를 읽어옵니다.
      // 'action' 쿼리 파라미터가 'comment'인 경우, 댓글을 수정합니다.
      if (query.action === 'comment') {
        return await updateComment(body) // 댓글 수정 함수 호출
      } else {
        // 'action'이 없거나 'comment'가 아닌 경우, 갤러리 항목을 수정합니다.
        return await updateGalleryItem(body) // 갤러리 항목 수정 함수 호출
      }
    } catch (error) {
      handleApiError(error, '갤러리 수정/댓글 수정 중 오류', 500);
    }
  }

  // DELETE 요청 처리: 갤러리 항목 또는 댓글을 삭제합니다.
  if (method === 'DELETE') {
    try {
      // 'action' 쿼리 파라미터가 'comment'인 경우, 댓글을 삭제합니다.
      if (query.action === 'comment') {
        return await deleteComment(parseInt(query.id)) // 댓글 삭제 함수 호출
      } else {
        // 'action'이 없거나 'comment'가 아닌 경우, 갤러리 항목을 삭제합니다.
        return await deleteGalleryItem(parseInt(query.id)) // 갤러리 항목 삭제 함수 호출
      }
    } catch (error) {
      handleApiError(error, '갤러리 삭제/댓글 삭제 중 오류', 500);
    }
  }

  // 지원하지 않는 HTTP 메소드에 대한 처리: 405 Method Not Allowed 오류를 반환합니다.
  throw createError({
    statusCode: 405,
    statusMessage: 'Method Not Allowed'
  })
})

/**
 * @function getGalleryList
 * @description 모든 갤러리 항목 목록을 조회합니다. 각 항목에 연결된 댓글 수를 포함합니다.
 * @returns {Array<object>} 갤러리 항목 목록 배열 (각 항목은 댓글 수를 포함합니다).
 */
async function getGalleryList() {
    return await prisma.galleryItem.findMany({
      orderBy: {
        createdAt: 'desc' // 최신 항목이 먼저 오도록 생성일 내림차순으로 정렬합니다.
      },
      include: {
        _count: { // _count 속성을 사용하여 관계된 레코드의 수를 가져옵니다.
          select: { GalleryComment: true } // GalleryComment 관계의 수를 선택합니다.
        },
        GalleryComment: { // 댓글 목록을 일부만 포함하여 조회 (성능 최적화를 위해 ID만 가져옵니다).
          select: {
            id: true
          }
        }
      }
    })
  }

/**
 * @function getGalleryThumbnails
 * @description 썸네일 모드로 갤러리 메타데이터만 조회 (이미지 제외)
 * @param {object} query - 쿼리 파라미터
 * @returns {object} 페이지네이션된 썸네일 목록
 */
async function getGalleryThumbnails(query) {
  const page = parseInt(query.page) || 1
  const limit = Math.min(parseInt(query.limit) || 12, 20) // 최대 20개
  const skip = (page - 1) * limit

  const [items, total] = await Promise.all([
    prisma.galleryItem.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        // content 필드 제외 (이미지 데이터 제외)
        _count: {
          select: { GalleryComment: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.galleryItem.count()
  ])

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    },
    mode: 'thumbnails'
  }
}

/**
 * @function getGalleryItemImage
 * @description 특정 갤러리 항목의 이미지만 조회 (성능 최적화)
 * @param {number} id - 갤러리 항목 ID
 * @returns {object} 이미지 데이터만 포함된 객체
 */
async function getGalleryItemImage(id) {
  const item = await prisma.galleryItem.findUnique({
    where: { id },
    select: {
      id: true,
      content: true // 이미지 데이터만 선택
    }
  })

  if (!item) {
    throw createError({
      statusCode: 404,
      statusMessage: '갤러리 항목을 찾을 수 없습니다.'
    })
  }

  return {
    id: item.id,
    content: item.content
  }
}

/**
 * @function getGalleryItem
 * @description 특정 ID의 갤러리 항목 상세 정보를 조회합니다. 관련 댓글 목록도 함께 포함합니다.
 * @param {number} id - 조회할 갤러리 항목의 고유 ID.
 * @returns {object} 조회된 갤러리 항목 객체 (댓글 목록 포함).
 */
async function getGalleryItem(id) {
  const info = await prisma.galleryItem.findUnique({
    where: { id }, // 제공된 ID로 갤러리 항목을 찾습니다.
    include: {
      GalleryComment: { // 댓글 조회: 최신 댓글이 먼저 오도록 생성일 내림차순으로 정렬합니다.
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })
  // Gallery info processed
  return info
}

/**
 * @function createGalleryItem
 * @description 새로운 갤러리 항목을 생성합니다.
 * @param {object} data - 생성할 갤러리 항목 데이터 객체. (title, content, description, tags 필드 포함).
 * @returns {object} 생성된 갤러리 항목 객체.
 */
async function createGalleryItem(data) {
  return await prisma.galleryItem.create({
    data: {
      title: data.title,
      content: data.content, // 갤러리 콘텐츠 (예: 이미지 URL 또는 텍스트 내용)
      description: data.description,
      tags: data.tags // 관련 태그 배열
    }
  })
}

/**
 * @function updateGalleryItem
 * @description 특정 ID의 갤러리 항목을 업데이트합니다.
 * @param {object} data - 업데이트할 갤러리 항목 데이터 객체. (id, title, content, description, tags 필드 포함).
 * @returns {object} 업데이트된 갤러리 항목 객체.
 */
async function updateGalleryItem(data) {
  return await prisma.galleryItem.update({
    where: { id: parseInt(data.id) }, // 업데이트할 갤러리 항목의 ID를 지정합니다.
    data: {
      title: data.title,
      content: data.content, // 갤러리 콘텐츠 업데이트
      description: data.description,
      tags: data.tags // 태그 배열 업데이트
    }
  })
}

/**
 * @function deleteGalleryItem
 * @description 특정 ID의 갤러리 항목과 관련된 모든 댓글을 삭제하고, Supabase Storage에서 관련 파일도 삭제합니다.
 * @param {number} id - 삭제할 갤러리 항목의 고유 ID.
 * @returns {object} 성공 여부를 나타내는 객체. (success: true).
 */
async function deleteGalleryItem(id) {
  // 트랜잭션을 사용하여 갤러리 항목과 관련된 모든 댓글 삭제를 원자적으로 처리합니다.
  await prisma.$transaction([
    // 해당 갤러리 항목에 연결된 모든 댓글을 먼저 삭제합니다.
    prisma.galleryComment.deleteMany({ where: { galleryItemId: id } }),
    // 갤러리 항목 자체를 삭제합니다.
    prisma.galleryItem.delete({ where: { id } })
  ])

  // Supabase Storage에서 해당 갤러리 항목 ID와 관련된 모든 파일을 삭제합니다.
  // 예시: 'gallery' 버킷 아래에 '[id]/*' 형식으로 저장된 모든 파일.
  const { data, error } = await supabase
    .storage
    .from('gallery')
    .remove([`${id}/*`]) // 갤러리 항목 ID를 기반으로 파일 경로를 구성하여 삭제 요청을 보냅니다.
  if (error) {
    console.error('Supabase 파일 삭제 중 오류:', error) // Supabase 파일 삭제 중 오류 발생 시 콘솔에 로그를 출력합니다.
  }
  return { success: true } // 성공적으로 삭제되었음을 반환합니다.
}

/**
 * @function addComment
 * @description 특정 갤러리 항목에 새로운 댓글을 추가합니다.
 * @param {object} data - 추가할 댓글 데이터 객체. (content, author, authorId, galleryItemId 필드 포함).
 * @returns {object} 생성된 댓글 객체.
 */
async function addComment(data) {
  return await prisma.galleryComment.create({
    data: {
      content: data.content,
      author: data.author,
      authorId: data.authorId,
      galleryItemId: parseInt(data.galleryItemId) // 댓글이 연결될 갤러리 항목의 ID (정수형으로 변환)
    }
  })
}

/**
 * @function updateComment
 * @description 특정 ID의 댓글 내용을 업데이트합니다.
 * @param {object} data - 업데이트할 댓글 데이터 객체. (id, content 필드 포함).
 * @returns {object} 업데이트된 댓글 객체.
 */
async function updateComment(data) {
  return await prisma.galleryComment.update({
    where: { id: parseInt(data.id) }, // 업데이트할 댓글의 ID를 지정합니다.
    data: {
      content: data.content // 업데이트할 댓글 내용
    }
  })
}

/**
 * @function deleteComment
 * @description 특정 ID의 댓글을 삭제합니다.
 * @param {number} id - 삭제할 댓글의 고유 ID.
 * @returns {object} 성공 여부를 나타내는 객체. (success: true).
 */
async function deleteComment(id) {
  await prisma.galleryComment.delete({ where: { id } }) // 제공된 ID를 사용하여 댓글 레코드를 데이터베이스에서 삭제합니다.
  return { success: true } // 성공적으로 삭제되었음을 반환합니다.
}

/**
 * @function getGalleryItemComments
 * @description 특정 갤러리 항목의 모든 댓글 목록을 조회합니다.
 * @param {number} id - 댓글을 조회할 갤러리 항목의 고유 ID.
 * @returns {Array<object>} 댓글 목록 배열.
 */
async function getGalleryItemComments(id) {
  // Getting gallery item comments
  const comments = await prisma.galleryComment.findMany({
    where: { galleryItemId: id }, // 해당 갤러리 항목에 연결된 댓글만 조회합니다.
    orderBy: {
      createdAt: 'desc' // 최신 댓글이 먼저 오도록 생성일 내림차순으로 정렬합니다.
    }
  })
  // Gallery comments retrieved
  return comments
}