// 플로팅 플레이어용 YouTube 비디오 목록 API
import { PrismaClient } from '@prisma/client'
import { handleApiError } from '~/server/utils/apiErrorHandlers'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 플로팅 플레이어에서 사용할 간단한 비디오 목록 조회
    const videos = await prisma.youTubeVideo.findMany({
      select: {
        id: true,
        videoId: true,
        title: true,
        description: true,
        isShort: true,
        isPlayable: true,
        categoryId: true,
        YouTubeVideoCategory: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        createdAt: true
      },
      where: {
        // 재생 가능한 비디오만 가져오기
        isPlayable: {
          not: false
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // 최대 50개까지만
    })

    // 썸네일 URL 추가
    const videosWithThumbnails = videos.map(video => ({
      ...video,
      thumbnail: `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`
    }))

    return videosWithThumbnails

  } catch (error) {
    console.error('YouTube 비디오 목록 API 오류:', error)
    handleApiError(event, error.statusCode || 500, error.message || 'YouTube 비디오 목록을 불러오는 데 실패했습니다.', error)
  }
})