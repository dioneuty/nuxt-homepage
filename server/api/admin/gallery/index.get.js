import { PrismaClient } from '@prisma/client';
import { verifyAuthToken } from '~/server/utils/auth';
import { handleApiError } from '~/server/utils/apiErrorHandlers';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // 관리자 권한 확인 미들웨어 (필요시 활성화)
    await verifyAuthToken(event);
    const userId = event.context.user.id;
    if (!userId || event.context.user.role !== 'ADMIN') {
        handleApiError(null, '접근 권한이 없습니다.', 403);
    }

    const query = getQuery(event);
    const id = parseInt(query.id);
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchType = query.searchType;
    const searchText = query.searchText;
    const galleryType = query.galleryType;
    const sortColumn = query.sortColumn || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    if (id) {
      // 단일 항목 조회 로직 유지
      const adminItem = await prisma.adminGalleryItem.findUnique({
        where: { id: id },
      });
      if (adminItem) {
        return { ...adminItem, galleryType: 'admin' };
      }
      const galleryItem = await prisma.galleryItem.findUnique({
        where: { id: id },
      });
      if (galleryItem) {
        return { ...galleryItem, galleryType: 'general' };
      }
      handleApiError(null, '갤러리 아이템을 찾을 수 없습니다.', 404);
    } else {
      // 통합 목록 조회 로직
      let adminWhere = {};
      let galleryWhere = {};

      if (searchText && searchType) {
        if (searchType === 'title') {
          adminWhere = { title: { contains: searchText, mode: 'insensitive' } };
          galleryWhere = { title: { contains: searchText, mode: 'insensitive' } };
        } else if (searchType === 'description') {
          adminWhere = { description: { contains: searchText, mode: 'insensitive' } };
          galleryWhere = { description: { contains: searchText, mode: 'insensitive' } };
        }
      }

      let adminItems = [];
      let adminTotal = 0;
      let galleryItems = [];
      let galleryTotal = 0;

      if (!galleryType || galleryType === 'admin') {
        const [items, total] = await Promise.all([
          prisma.adminGalleryItem.findMany({
            where: adminWhere,
            orderBy: { [sortColumn]: sortOrder },
          }),
          prisma.adminGalleryItem.count({ where: adminWhere }),
        ]);
        adminItems = items;
        adminTotal = total;
      }

      if (!galleryType || galleryType === 'general') {
        const [items, total] = await Promise.all([
          prisma.galleryItem.findMany({
            where: galleryWhere,
            orderBy: { [sortColumn]: sortOrder },
          }),
          prisma.galleryItem.count({ where: galleryWhere }),
        ]);
        galleryItems = items;
        galleryTotal = total;
      }

      const combinedItems = [
        ...(galleryType !== 'general' ? adminItems.map(item => ({ ...item, galleryType: 'admin' })) : []),
        ...(galleryType !== 'admin' ? galleryItems.map(item => ({ ...item, galleryType: 'general' })) : []),
      ];

      // 정렬 및 페이지네이션
      combinedItems.sort((a, b) => {
        let comparison = 0;
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (sortColumn === 'createdAt') {
          comparison = new Date(aValue).getTime() - new Date(bValue).getTime();
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else {
          // Fallback for other types or null/undefined values
          const strA = String(aValue || '');
          const strB = String(bValue || '');
          comparison = strA.localeCompare(strB);
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });

      const paginatedItems = combinedItems.slice(skip, skip + limit);

      return {
        items: paginatedItems,
        total: combinedItems.length,
        page,
        limit,
      };
    }
  } catch (error) {
    handleApiError(error, error.message || '갤러리 아이템을 불러오는 데 실패했습니다.', error.statusCode || 500);
  }
}); 