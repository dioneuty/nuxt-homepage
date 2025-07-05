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

    const body = await readBody(event);
    const { url, title, description, isShort } = body;

    if (!url || !title) {
      handleApiError(event, 400, 'YouTube URL과 제목은 필수 입력 사항입니다.');
    }

    // YouTube URL에서 videoId 추출
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    if (!videoId) {
      handleApiError(event, 400, '유효한 YouTube URL이 아닙니다.');
    }

    // 중복 체크
    const existingVideo = await prisma.youTubeVideo.findUnique({
      where: { videoId },
    });

    if (existingVideo) {
      handleApiError(event, 409, '이미 등록된 YouTube 비디오입니다.');
    }

    // 비디오 생성
    const newVideo = await prisma.youTubeVideo.create({
      data: {
        videoId,
        title,
        description: description || '',
        isShort: isShort || false,
      },
    });

    return {
      success: true,
      item: newVideo,
    };

  } catch (error) {
    handleApiError(event, error.statusCode || 500, error.message || 'YouTube 비디오 생성에 실패했습니다.', error);
  }
}); 