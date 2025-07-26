import { PrismaClient } from '@prisma/client';
import { verifyAuthToken } from '~/server/utils/auth';
import { handleApiError } from '~/server/utils/apiErrorHandlers';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // 관리자 권한 확인
    await verifyAuthToken(event);
    const userId = event.context.user.id;
    if (!userId || event.context.user.role !== 'ADMIN') {
      handleApiError(event, 403, '접근 권한이 없습니다.');
    }

    const query = getQuery(event);
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchText = query.searchText;
    const searchType = query.searchType;
    const categoryId = query.categoryId;
    const sortColumn = query.sortColumn || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    // 검색 조건 설정
    let where = {};
    
    // 카테고리 필터링
    if (categoryId && categoryId !== 'all') {
      where.categoryId = parseInt(categoryId);
    }
    
    // 텍스트 검색 조건
    if (searchText && searchType) {
      if (searchType === 'title') {
        where.title = { contains: searchText, mode: 'insensitive' };
      } else if (searchType === 'description') {
        where.description = { contains: searchText, mode: 'insensitive' };
      }
    }

    // 데이터 조회
    const [items, total] = await Promise.all([
      prisma.youTubeVideo.findMany({
        where,
        orderBy: { [sortColumn]: sortOrder },
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }),
      prisma.youTubeVideo.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

  } catch (error) {
    handleApiError(event, error.statusCode || 500, error.message || 'YouTube 비디오 목록을 불러오는 데 실패했습니다.', error);
  }
}); 