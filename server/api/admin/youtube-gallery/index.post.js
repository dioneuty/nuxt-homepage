import { PrismaClient } from '@prisma/client';
import { verifyAuthToken } from '~/server/utils/auth';
import { handleApiError } from '~/server/utils/apiErrorHandlers';
import { getYouTubeVideoInfo, extractVideoId } from '~/server/utils/youtube';

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
    const { url, title, description, isShort, categoryId } = body;

    if (!url || !title) {
      handleApiError(event, 400, 'YouTube URL과 제목은 필수 입력 사항입니다.');
    }

    // YouTube URL에서 videoId 추출
    const videoId = extractVideoId(url);
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

    // YouTube API에서 비디오 정보 가져오기 (업로드 일 포함)
    const youtubeInfo = await getYouTubeVideoInfo(videoId);
    
    // 비디오 생성 데이터 준비
    const videoData = {
      videoId,
      title,
      description: description || '',
      isShort: isShort || false,
      categoryId: categoryId ? parseInt(categoryId) : null,
    };

    // YouTube API에서 업로드 일을 가져올 수 있으면 추가
    if (youtubeInfo && youtubeInfo.uploadedAt) {
      videoData.uploadedAt = youtubeInfo.uploadedAt;
      
      // 제목이나 설명이 비어있으면 YouTube에서 가져온 정보로 채움
      if (!title.trim() && youtubeInfo.title) {
        videoData.title = youtubeInfo.title;
      }
      if (!description && youtubeInfo.description) {
        videoData.description = youtubeInfo.description;
      }
    }

    // 비디오 생성
    const newVideo = await prisma.youTubeVideo.create({
      data: videoData,
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
      item: newVideo,
    };

  } catch (error) {
    handleApiError(event, error.statusCode || 500, error.message || 'YouTube 비디오 생성에 실패했습니다.', error);
  }
}); 