import prisma from '~/server/utils/prisma'
import { handleApiError } from '~/server/utils/apiErrorHandlers'
import { verifyAuthToken } from '~/server/utils/auth'

// YouTube 카테고리 관리 API
export default defineEventHandler(async (event) => {
  try {
    // 관리자 권한 확인
    await verifyAuthToken(event);
    const userId = event.context.user.id;
    if (!userId || event.context.user.role !== 'ADMIN') {
      return handleApiError(event, 403, '접근 권한이 없습니다.');
    }
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    return handleApiError(event, 401, '인증 실패', error);
  }

  const method = event.node.req.method

  if (method === 'GET') {
    try {
      console.log('YouTube Categories ADMIN API: 카테고리 조회 시작')
      
      // 1. 실제 카테고리들과 그들의 비디오 수
      const categories = await prisma.youTubeVideoCategory.findMany({
        include: {
          _count: { select: { videos: true } }
        },
        orderBy: { order: 'asc' }
      })
      
      // 2. categoryId가 null인 비디오 수 (진짜 미분류)
      const uncategorizedVideoCount = await prisma.youTubeVideo.count({
        where: { categoryId: null }
      })
      
      console.log('YouTube Categories ADMIN API: 원본 카테고리 데이터:', categories)
      console.log('YouTube Categories ADMIN API: categoryId가 null인 비디오 수:', uncategorizedVideoCount)
      
      // 3. 카테고리 처리: "미분류" 카테고리는 실제 null 비디오 수로 설정
      const categoriesWithCount = categories.map(category => {
        if (category.slug === 'uncategorized') {
          // 데이터베이스의 "미분류" 카테고리는 categoryId가 null인 비디오 수로 설정
          return {
            ...category,
            video_count: uncategorizedVideoCount
          }
        } else {
          // 다른 카테고리들은 기존 로직 사용
          return {
            ...category,
            video_count: category._count.videos
          }
        }
      })

      console.log('YouTube Categories ADMIN API: 처리된 카테고리:', categoriesWithCount)
      console.log('YouTube Categories ADMIN API: 최종 결과:', categoriesWithCount)

      return categoriesWithCount
    } catch (error) {
      return handleApiError(event, 500, 'YouTube 카테고리 조회 실패', error);
    }
  }

  if (method === 'POST') {
    // 개별 카테고리 추가
    const { name } = await readBody(event)
    
    if (!name || !name.trim()) {
      return handleApiError(event, 400, '카테고리 이름이 필요합니다.');
    }

    try {
      const slug = name.toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()

      // 다음 order 값 계산
      const maxOrder = await prisma.youTubeVideoCategory.aggregate({
        _max: { order: true }
      })
      const nextOrder = (maxOrder._max.order || 0) + 1

      const newCategory = await prisma.youTubeVideoCategory.create({
        data: {
          name: name.trim(),
          slug,
          order: nextOrder,
          updatedAt: new Date() // updatedAt 필드 추가
        }
      })

      console.log('YouTube Categories ADMIN API: 카테고리 추가 완료:', newCategory)
      return newCategory
    } catch (error) {
      return handleApiError(event, 500, '카테고리 추가 실패', error);
    }
  }

  if (method === 'PUT') {
    const body = await readBody(event)
    
    // 기존 전체 업데이트 방식과 개별 수정 방식 구분
    if (body.categories && body.deletedCategories) {
      // 기존 전체 업데이트 방식
      const { categories, deletedCategories } = body
      try {
        await prisma.$transaction(async (prisma) => {
        let defaultCategory = await prisma.youTubeVideoCategory.findFirst({
          where: { slug: 'uncategorized' }
        })
        if (!defaultCategory) {
          defaultCategory = await prisma.youTubeVideoCategory.upsert({
            where: { slug: 'uncategorized' },
            update: {},
            create: { 
              name: '미분류', 
              slug: 'uncategorized',
              order: 999,
              updatedAt: new Date() // updatedAt 필드 추가
            }
          })
        }

        // 삭제된 카테고리 처리
        for (const deletedCategoryId of deletedCategories) {
          // 해당 카테고리의 비디오들을 기본 카테고리로 이동
          await prisma.youTubeVideo.updateMany({
            where: { categoryId: parseInt(deletedCategoryId) },
            data: { categoryId: defaultCategory.id }
          })
          // 카테고리 삭제
          await prisma.youTubeVideoCategory.delete({
            where: { id: parseInt(deletedCategoryId) }
          })
        }

        // 카테고리 업데이트/생성
        for (let i = 0; i < categories.length; i++) {
          const category = categories[i]
          const slug = category.slug || category.name.toLowerCase()
            .replace(/[^a-z0-9가-힣\s-]/g, '')
            .replace(/\s+/g, '-')
            .trim()
          
          if (category.id && category.id !== 'all') {
            await prisma.youTubeVideoCategory.update({
              where: { id: parseInt(category.id) },
              data: { 
                name: category.name, 
                slug,
                order: i
              }
            })
          } else if (category.id !== 'all') {
            await prisma.youTubeVideoCategory.create({
              data: { 
                name: category.name, 
                slug,
                order: i,
                updatedAt: new Date() // updatedAt 필드 추가
              }
            })
          }
        }
        })

        return { success: true }
      } catch (error) {
        return handleApiError(event, 500, 'YouTube 카테고리 업데이트 실패', error);
      }
    } else {
      // 개별 수정 방식은 별도 API 사용
      return handleApiError(event, 400, '잘못된 요청 형식입니다.');
    }
  }

  return handleApiError(event, 405, 'Method Not Allowed');
})