import { PrismaClient } from '@prisma/client';
import { verifyAuthToken } from '~/server/utils/auth';
import { handleApiError } from '~/server/utils/apiErrorHandlers';
import { getYouTubeVideosInfo } from '~/server/utils/youtube';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // 관리자 권한 확인
    await verifyAuthToken(event);
    const userId = event.context.user.id;
    if (!userId || event.context.user.role !== 'ADMIN') {
      handleApiError(event, 403, '접근 권한이 없습니다.');
    }

    // uploadedAt이 null인 비디오들 조회
    const videosWithoutUploadDate = await prisma.youTubeVideo.findMany({
      where: {
        uploadedAt: null
      },
      select: {
        id: true,
        videoId: true,
        title: true
      }
    });

    if (videosWithoutUploadDate.length === 0) {
      return {
        success: true,
        message: '모든 비디오에 업로드 일이 설정되어 있습니다.',
        updatedCount: 0
      };
    }

    console.log(`${videosWithoutUploadDate.length}개 비디오의 업로드 일을 업데이트합니다...`);

    // YouTube API에서 정보 가져오기
    const videoIds = videosWithoutUploadDate.map(v => v.videoId);
    const youtubeInfos = await getYouTubeVideosInfo(videoIds);

    // 업데이트할 데이터 매핑
    const updateMap = new Map();
    youtubeInfos.forEach(info => {
      if (info.uploadedAt) {
        updateMap.set(info.videoId, info.uploadedAt);
      }
    });

    let updatedCount = 0;
    const failedVideos = [];

    // 각 비디오 업데이트
    for (const video of videosWithoutUploadDate) {
      try {
        const uploadedAt = updateMap.get(video.videoId);
        
        if (uploadedAt) {
          await prisma.youTubeVideo.update({
            where: { id: video.id },
            data: { uploadedAt }
          });
          updatedCount++;
          console.log(`업데이트 완료: ${video.title} (${video.videoId})`);
        } else {
          const apiKey = process.env.YOUTUBE_API_KEY;
          const reason = !apiKey || apiKey === 'your_youtube_api_key_here' 
            ? 'YouTube API 키가 설정되지 않았습니다' 
            : 'YouTube API에서 정보를 가져올 수 없음';
          
          failedVideos.push({
            id: video.id,
            videoId: video.videoId,
            title: video.title,
            reason
          });
        }
      } catch (error) {
        console.error(`비디오 업데이트 실패: ${video.title}`, error);
        failedVideos.push({
          id: video.id,
          videoId: video.videoId,
          title: video.title,
          reason: error.message
        });
      }
    }

    return {
      success: true,
      message: `${updatedCount}개 비디오의 업로드 일을 성공적으로 업데이트했습니다.`,
      updatedCount,
      totalCount: videosWithoutUploadDate.length,
      failedCount: failedVideos.length,
      failedVideos: failedVideos.length > 0 ? failedVideos : undefined
    };

  } catch (error) {
    console.error('업로드 일 업데이트 실패:', error);
    handleApiError(event, error.statusCode || 500, error.message || '업로드 일 업데이트에 실패했습니다.', error);
  }
});