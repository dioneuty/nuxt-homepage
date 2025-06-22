import { ref } from 'vue'

/**
 * @function useYoutubeGallery
 * @description YouTube 갤러리 관련 함수를 제공하는 컴포저블 함수입니다.
 * @param {Ref<Array<Object>>} videosRef - YouTube 영상 데이터의 반응형 참조
 * @returns {Object} YouTube 갤러리 관련 함수와 상태
 * @property {Ref<boolean>} showYoutubeModal - YouTube 크게 보기 모달 가시성
 * @property {Ref<string>} currentYoutubeVideoId - 현재 크게 볼 YouTube 영상 ID
 * @property {function(string): void} handleOpenYoutubeModal - YouTube 크게 보기 모달을 열고 영상 ID를 설정하는 함수
 * @property {function(): void} handleCloseYoutubeModal - YouTube 크게 보기 모달을 닫는 함수
 */
export default function useYoutubeGallery(videosRef) {
  const showYoutubeModal = ref(false); // YouTube 크게 보기 모달 가시성
  const currentYoutubeVideoId = ref(null); // 현재 크게 볼 YouTube 영상 ID

  /**
   * @function getThumbnailUrl
   * @description YouTube 썸네일 이미지 URL을 반환합니다.
   * @param {string} videoId - YouTube 영상 ID
   * @returns {string} 썸네일 이미지 URL
   */
  function getThumbnailUrl(videoId) {
    return `https://img.youtube.com/vi/${videoId}/0.jpg`
  }

  /**
   * @function getEmbedUrl
   * @description YouTube 영상 임베드 URL을 반환합니다.
   * @param {Object} video - YouTube 영상 데이터
   * @returns {string} 임베드 URL
   */
  function getEmbedUrl(video) {
    if (video.isShort) {
      return `https://www.youtube.com/embed/${video.id}?autoplay=1`
    }
    return `https://www.youtube.com/embed/${video.id}?autoplay=1`
  }

  /**
   * @function loadVideo
   * @description YouTube 영상을 로드합니다.
   * @param {Object} video - YouTube 영상 데이터
   */
  function loadVideo(video) {
    video.loaded = true

    // 다른 곳의 video.loaded를 false로 만들기
    videosRef.value.forEach(v => {
      if (v.id !== video.id) {
        v.loaded = false
      }
    })
  }

  /**
   * @function unloadVideo
   * @description YouTube 영상을 언로드합니다.
   * @param {Object} video - YouTube 영상 데이터
   */
  function unloadVideo(video) {
    video.loaded = false
  }

  /**
   * @function getAspectRatioClass
   * @description YouTube 영상의 비율을 반환합니다.
   * @param {Object} video - YouTube 영상 데이터
   * @returns {string} 비율 클래스
   */
  function getAspectRatioClass(video) {
    return video.isShort ? 'aspect-w-9 aspect-h-16' : 'aspect-w-16 aspect-h-9'
  }

  /**
   * @function handleOpenYoutubeModal
   * @description YouTube 크게 보기 모달을 열고 영상 ID를 설정합니다.
   * @param {string} videoId - 크게 볼 YouTube 영상의 ID.
   */
  const handleOpenYoutubeModal = (videoId) => {
    currentYoutubeVideoId.value = videoId;
    showYoutubeModal.value = true;
  };

  /**
   * @function handleCloseYoutubeModal
   * @description YouTube 크게 보기 모달을 닫습니다.
   */
  const handleCloseYoutubeModal = () => {
    showYoutubeModal.value = false;
    currentYoutubeVideoId.value = null; // 모달이 닫힐 때 영상 ID 초기화
  };

  return {
    // 1. YouTube 갤러리 관련 상태
    showYoutubeModal, // YouTube 크게 보기 모달 가시성
    currentYoutubeVideoId, // 현재 크게 볼 YouTube 영상 ID

    // 2. YouTube 갤러리 관련 함수
    getThumbnailUrl, // YouTube 썸네일 이미지 URL을 반환합니다.
    getEmbedUrl, // YouTube 영상 임베드 URL을 반환합니다.
    loadVideo, // YouTube 영상을 로드합니다.
    unloadVideo, // YouTube 영상을 언로드합니다.
    getAspectRatioClass, // YouTube 영상의 비율을 반환합니다.
    handleOpenYoutubeModal, // YouTube 크게 보기 모달을 열고 영상 ID를 설정하는 함수
    handleCloseYoutubeModal, // YouTube 크게 보기 모달을 닫는 함수
  }
} 