import prisma from '~/server/utils/prisma'
import { handleApiError } from '~/server/utils/apiErrorHandlers'

/**
 * @file 카테고리 관리 API
 * @description 블로그 게시물 카테고리에 대한 조회 및 업데이트 작업을 처리합니다.
 *              카테고리 목록과 각 카테고리의 게시물 수를 조회하고, 카테고리를 추가, 수정, 삭제하는 기능을 제공합니다.
 */
export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  // GET 요청 처리: 모든 카테고리 목록 및 각 카테고리의 게시물 수를 조회합니다.
  if (method === 'GET') {
    try {
      // Prisma를 사용하여 모든 카테고리를 조회하고, 각 카테고리에 연결된 블로그 게시물 수를 포함합니다.
      const categories = await prisma.category.findMany({
        include: {
          _count: { // _count 속성을 사용하여 관계된 레코드의 수를 가져옵니다.
            select: { blogPosts: true } // blogPosts 관계의 수를 선택합니다.
          }
        }
      })
      
      // 조회된 카테고리 데이터에 'post_count' 필드를 추가하여 게시물 수를 포함시킵니다.
      const categoriesWithCount = categories.map(category => ({
        ...category,
        post_count: category._count.blogPosts
      }))

      // 모든 카테고리의 총 게시물 수를 계산합니다.
      const totalPosts = categoriesWithCount.reduce((sum, category) => sum + category.post_count, 0)

      // "전체" 카테고리를 목록의 맨 앞에 추가합니다. 이 카테고리는 모든 게시물의 합계를 나타냅니다.
      const allCategory = {
        id: 'all', // 고유 식별자 (실제 DB ID 아님)
        name: '전체',
        post_count: totalPosts
      }

      // "전체" 카테고리를 포함한 카테고리 목록을 반환합니다.
      return [allCategory, ...categoriesWithCount]
    } catch (error) {
      // 카테고리 조회 중 오류 발생 시 로깅하고 500 Internal Server Error 반환
      handleApiError(error, '카테고리 조회 실패', 500);
    }
  }

  // PUT 요청 처리: 카테고리를 업데이트하거나 새로 생성하고, 삭제된 카테고리를 처리합니다.
  if (method === 'PUT') {
    // 요청 본문에서 업데이트할 카테고리 목록과 삭제할 카테고리 ID 목록을 읽어옵니다.
    const { categories, deletedCategories } = await readBody(event)
    try {
      // 트랜잭션을 사용하여 여러 데이터베이스 작업을 원자적으로 처리합니다.
      // 이 트랜잭션 내의 모든 작업이 성공해야만 변경 사항이 적용됩니다.
      await prisma.$transaction(async (prisma) => {
        // 기본 카테고리 (삭제된 카테고리 게시물을 이전할 대상)를 확인하거나 생성합니다.
        let defaultCategory = await prisma.category.findFirst({
          where: { slug: 'default-category' }
        })
        if (!defaultCategory) {
          defaultCategory = await prisma.category.upsert({
            where: { slug: 'default-category' },
            update: {},
            create: { 
              name: '기본 카테고리', 
              slug: 'default-category'
            }
          })
        }

        // 삭제된 카테고리 처리: 각 삭제된 카테고리에 대해 연결된 블로그 게시물을 기본 카테고리로 이동한 후 카테고리를 삭제합니다.
        for (const deletedCategoryId of deletedCategories) {
          // 해당 카테고리의 블로그 포스트를 기본 카테고리로 이동합니다.
          await prisma.blogPost.updateMany({
            where: { categoryId: parseInt(deletedCategoryId) },
            data: { categoryId: defaultCategory.id }
          })

          // 카테고리 삭제
          await prisma.category.delete({
            where: { id: parseInt(deletedCategoryId) }
          })
        }

        // 나머지 카테고리 업데이트 또는 생성: 기존 카테고리는 업데이트하고, ID가 없는 카테고리는 새로 생성합니다.
        for (const category of categories) {
          // 카테고리 slug를 생성합니다 (이름을 소문자로 변환하고 공백을 하이픈으로 대체).
          const slug = category.slug || category.name.toLowerCase().replace(/ /g, '-')
          if (category.id) {
            // 기존 카테고리 업데이트
            await prisma.category.update({
              where: { id: parseInt(category.id) },
              data: {
                name: category.name,
                slug: slug
              }
            })
          } else {
            // 새 카테고리 생성
            await prisma.category.create({
              data: {
                name: category.name,
                slug: slug
              }
            })
          }
        }
      })

      return { success: true } // 업데이트 성공 응답
    } catch (error) {
      // 카테고리 업데이트/삭제 중 오류 발생 시 로깅하고 500 Internal Server Error 반환
      handleApiError(error, '카테고리 업데이트 실패', 500);
    }
  }

  // 지원하지 않는 HTTP 메소드에 대한 처리: 405 Method Not Allowed 반환
  throw handleApiError(405, 'Method Not Allowed');
})