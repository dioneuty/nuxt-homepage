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

    const id = parseInt(getRouterParam(event, 'id'));
    if (!id || isNaN(id)) {
      handleApiError(event, 400, '유효하지 않은 비디오 ID입니다.');
    }

    // 기존 비디오 확인
    const existingVideo = await prisma.youTubeVideo.findUnique({
      where: { id },
    });

    if (!existingVideo) {
      handleApiError(event, 404, 'YouTube 비디오를 찾을 수 없습니다.');
    }

    // 비디오 삭제
    await prisma.youTubeVideo.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'YouTube 비디오가 성공적으로 삭제되었습니다.',
    };

  } catch (error) {
    handleApiError(event, error.statusCode || 500, error.message || 'YouTube 비디오 삭제에 실패했습니다.', error);
  }
}); 