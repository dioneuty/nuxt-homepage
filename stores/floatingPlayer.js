import { defineStore } from 'pinia'

export const useFloatingPlayerStore = defineStore('floatingPlayer', {
  state: () => ({
    isVisible: false,
    videoId: null,
    videoTitle: '',
    position: {
      x: process.client ? window.innerWidth - 520 : 800, // 기본 위치: 우측 하단
      y: process.client ? window.innerHeight - 350 : 400,
    },
    size: {
      width: 500,
      height: 281, // 16:9 비율 (500 * 9 / 16 = 281.25)
    },
    isMinimized: false,
    isDragging: false,
    showVideoList: false, // 비디오 목록 표시 여부
    videoList: [], // 로드된 비디오 목록
    currentVideoIndex: -1, // 현재 재생 중인 비디오 인덱스
    isLoading: false, // 비디오 목록 로딩 상태
  }),

  actions: {
    openVideo(videoId, title = '') {
      this.videoId = videoId
      this.videoTitle = title
      this.isVisible = true
      this.isMinimized = false
      
      // 현재 재생 중인 비디오 인덱스 업데이트
      const index = this.videoList.findIndex(video => video.videoId === videoId)
      if (index !== -1) {
        this.currentVideoIndex = index
      }
    },

    closePlayer() {
      this.isVisible = false
      this.videoId = null
      this.videoTitle = ''
      this.showVideoList = false
    },

    toggleMinimize() {
      this.isMinimized = !this.isMinimized
    },

    toggleVideoList() {
      this.showVideoList = !this.showVideoList
      
      // 비디오 목록이 열릴 때 플레이어도 표시
      if (this.showVideoList && !this.isVisible) {
        this.isVisible = true
      }
      
      // 비디오 목록이 없으면 로드
      if (this.showVideoList && this.videoList.length === 0) {
        this.loadVideoList()
      }
      
      // 목록이 닫힐 때 비디오가 재생 중이라면 비디오 화면으로 돌아가기
      if (!this.showVideoList && this.videoId) {
        // 이미 비디오가 재생 중이므로 아무것도 안 함
      }
    },

    async loadVideoList() {
      try {
        this.isLoading = true
        const response = await $fetch('/api/youtube-videos')
        this.videoList = response || []
      } catch (error) {
        console.error('비디오 목록 로드 실패:', error)
        this.videoList = []
      } finally {
        this.isLoading = false
      }
    },

    playVideoFromList(video, index) {
      this.openVideo(video.videoId, video.title)
      this.currentVideoIndex = index
      // 비디오 재생 시 목록을 닫습니다
      this.showVideoList = false
    },

    playNext() {
      if (this.videoList.length === 0) return
      
      const nextIndex = (this.currentVideoIndex + 1) % this.videoList.length
      const nextVideo = this.videoList[nextIndex]
      this.playVideoFromList(nextVideo, nextIndex)
    },

    playPrevious() {
      if (this.videoList.length === 0) return
      
      const prevIndex = this.currentVideoIndex <= 0 
        ? this.videoList.length - 1 
        : this.currentVideoIndex - 1
      const prevVideo = this.videoList[prevIndex]
      this.playVideoFromList(prevVideo, prevIndex)
    },

    updatePosition(x, y) {
      // 화면 경계 체크 (클라이언트에서만)
      if (process.client) {
        const maxX = window.innerWidth - this.size.width
        const maxY = window.innerHeight - this.size.height
        
        // 위치 업데이트 최적화: 정수로 반올림하여 미세한 변화 방지
        this.position.x = Math.round(Math.max(0, Math.min(x, maxX)))
        this.position.y = Math.round(Math.max(0, Math.min(y, maxY)))
      } else {
        this.position.x = x
        this.position.y = y
      }
    },

    setDragging(isDragging) {
      this.isDragging = isDragging
    },

    resetPosition() {
      if (process.client) {
        this.position.x = window.innerWidth - 520
        this.position.y = window.innerHeight - 350
      }
    }
  },

  getters: {
    playerStyle: (state) => ({
      position: 'fixed',
      left: `${state.position.x}px`,
      top: `${state.position.y}px`,
      width: `${state.size.width}px`,
      height: state.isMinimized ? '60px' : `${state.size.height + 60}px`, // 헤더 포함
      zIndex: 9999,
      transition: state.isDragging ? 'none' : 'all 0.3s ease',
    }),

    youtubeEmbedUrl: (state) => {
      if (!state.videoId) return ''
      return `https://www.youtube.com/embed/${state.videoId}?autoplay=1&modestbranding=1&rel=0`
    },

    currentVideo: (state) => {
      if (state.currentVideoIndex >= 0 && state.currentVideoIndex < state.videoList.length) {
        return state.videoList[state.currentVideoIndex]
      }
      return null
    },

    hasNext: (state) => {
      return state.videoList.length > 0 && state.currentVideoIndex < state.videoList.length - 1
    },

    hasPrevious: (state) => {
      return state.videoList.length > 0 && state.currentVideoIndex > 0
    }
  }
})