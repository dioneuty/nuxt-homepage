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

    const body = await readBody(event);
    const { url, title, description, isShort, categoryId } = body;

    if (!title) {
      handleApiError(event, 400, '제목은 필수 입력 사항입니다.');
    }

    // 기존 비디오 확인
    const existingVideo = await prisma.youTubeVideo.findUnique({
      where: { id },
    });

    if (!existingVideo) {
      handleApiError(event, 404, 'YouTube 비디오를 찾을 수 없습니다.');
    }

    let updateData = {
      title,
      description: description || '',
      isShort: isShort || false,
      categoryId: categoryId ? parseInt(categoryId) : null,
    };

    // URL이 변경된 경우 videoId 업데이트
    if (url && url !== `https://www.youtube.com/watch?v=${existingVideo.videoId}`) {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      if (!videoId) {
        handleApiError(event, 400, '유효한 YouTube URL이 아닙니다.');
      }

      // 다른 비디오와 중복 체크
      const duplicateVideo = await prisma.youTubeVideo.findFirst({
        where: {
          videoId,
          id: { not: id },
        },
      });

      if (duplicateVideo) {
        handleApiError(event, 409, '이미 등록된 YouTube 비디오입니다.');
      }

      updateData.videoId = videoId;
    }

    // 비디오 업데이트
    const updatedVideo = await prisma.youTubeVideo.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    return {
      success: true,
      item: updatedVideo,
    };

  } catch (error) {
    handleApiError(event, error.statusCode || 500, error.message || 'YouTube 비디오 수정에 실패했습니다.', error);
  }
}); 