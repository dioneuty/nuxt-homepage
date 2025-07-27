/**
 * YouTube Data API v3 utility functions
 */

/**
 * YouTube 비디오 정보를 가져오는 함수
 * @param {string} videoId - YouTube 비디오 ID
 * @returns {Promise<Object|null>} 비디오 정보 또는 null
 */
export async function getYouTubeVideoInfo(videoId) {
  try {
    // YouTube API 키가 환경변수에 설정되어 있는지 확인
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey || apiKey === 'your_youtube_api_key_here') {
      console.warn('YouTube API 키가 설정되지 않았습니다. .env 파일에 YOUTUBE_API_KEY를 설정해주세요.');
      return null;
    }

    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('YouTube API 호출 실패:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.warn('YouTube 비디오를 찾을 수 없습니다:', videoId);
      return null;
    }

    const video = data.items[0];
    const snippet = video.snippet;

    return {
      videoId: video.id,
      title: snippet.title,
      description: snippet.description,
      uploadedAt: new Date(snippet.publishedAt),
      channelTitle: snippet.channelTitle,
      thumbnails: snippet.thumbnails
    };

  } catch (error) {
    console.error('YouTube API 호출 중 오류:', error);
    return null;
  }
}

/**
 * YouTube URL에서 비디오 ID를 추출하는 함수
 * @param {string} url - YouTube URL
 * @returns {string|null} 비디오 ID 또는 null
 */
export function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * 여러 비디오의 정보를 한 번에 가져오는 함수 (최대 50개)
 * @param {string[]} videoIds - YouTube 비디오 ID 배열
 * @returns {Promise<Object[]>} 비디오 정보 배열
 */
export async function getYouTubeVideosInfo(videoIds) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey || apiKey === 'your_youtube_api_key_here') {
      console.warn('YouTube API 키가 설정되지 않았습니다. .env 파일에 YOUTUBE_API_KEY를 설정해주세요.');
      return [];
    }

    // YouTube API는 한 번에 최대 50개까지 처리 가능
    const batchSize = 50;
    const results = [];

    for (let i = 0; i < videoIds.length; i += batchSize) {
      const batch = videoIds.slice(i, i + batchSize);
      const ids = batch.join(',');
      
      const url = `https://www.googleapis.com/youtube/v3/videos?id=${ids}&part=snippet&key=${apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('YouTube API 배치 호출 실패:', response.status, response.statusText);
        continue;
      }

      const data = await response.json();
      
      if (data.items) {
        const batchResults = data.items.map(video => ({
          videoId: video.id,
          title: video.snippet.title,
          description: video.snippet.description,
          uploadedAt: new Date(video.snippet.publishedAt),
          channelTitle: video.snippet.channelTitle,
          thumbnails: video.snippet.thumbnails
        }));
        
        results.push(...batchResults);
      }

      // API 요청 제한을 고려한 지연
      if (i + batchSize < videoIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;

  } catch (error) {
    console.error('YouTube API 배치 호출 중 오류:', error);
    return [];
  }
}