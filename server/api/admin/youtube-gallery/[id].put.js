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
      handleApiError(null, '접근 권한이 없습니다.', 403);
    }

    const id = parseInt(getRouterParam(event, 'id'));
    if (!id || isNaN(id)) {
      handleApiError(null, '유효하지 않은 비디오 ID입니다.', 400);
    }

    const body = await readBody(event);
    const { url, title, description, isShort } = body;

    if (!title) {
      handleApiError(null, '제목은 필수 입력 사항입니다.', 400);
    }

    // 기존 비디오 확인
    const existingVideo = await prisma.youTubeVideo.findUnique({
      where: { id },
    });

    if (!existingVideo) {
      handleApiError(null, 'YouTube 비디오를 찾을 수 없습니다.', 404);
    }

    let updateData = {
      title,
      description: description || '',
      isShort: isShort || false,
    };

    // URL이 변경된 경우 videoId 업데이트
    if (url && url !== `https://www.youtube.com/watch?v=${existingVideo.videoId}`) {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      if (!videoId) {
        handleApiError(null, '유효한 YouTube URL이 아닙니다.', 400);
      }

      // 다른 비디오와 중복 체크
      const duplicateVideo = await prisma.youTubeVideo.findFirst({
        where: {
          videoId,
          id: { not: id },
        },
      });

      if (duplicateVideo) {
        handleApiError(null, '이미 등록된 YouTube 비디오입니다.', 409);
      }

      updateData.videoId = videoId;
    }

    // 비디오 업데이트
    const updatedVideo = await prisma.youTubeVideo.update({
      where: { id },
      data: updateData,
    });

    return {
      success: true,
      item: updatedVideo,
    };

  } catch (error) {
    handleApiError(error, error.message || 'YouTube 비디오 수정에 실패했습니다.', error.statusCode || 500);
  }
}); 