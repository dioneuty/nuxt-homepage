<template>
  <ClientOnly>
    <Teleport to="body">
      <div
        v-if="store.isVisible"
        :style="playerStyle"
        class="floating-youtube-player"
        @mousedown="handleMouseDown"
      >
        <!-- 헤더 -->
        <div
          class="header"
          @mousedown="startDrag"
        >
          <div class="title-section">
            <Icon name="mdi:youtube" class="youtube-icon" />
            <span class="title-text" :title="store.videoTitle">
              {{ store.videoTitle || 'YouTube Player' }}
            </span>
          </div>
          
          <div class="controls">
            <!-- 최소화 시 오디오 컨트롤 -->
            <div v-if="store.isMinimized && store.youtubeEmbedUrl" class="minimized-controls">
              <button
                @click="store.playPrevious"
                :disabled="!store.hasPrevious"
                class="control-btn audio-control"
                title="이전 비디오"
              >
                <Icon name="mdi:skip-previous" class="control-icon" />
              </button>
              
              <button
                @click="store.playNext"
                :disabled="!store.hasNext"
                class="control-btn audio-control"
                title="다음 비디오"
              >
                <Icon name="mdi:skip-next" class="control-icon" />
              </button>
            </div>
            
            <!-- 일반 컨트롤 (최소화되지 않았을 때) -->
            <div v-if="!store.isMinimized" class="normal-controls">
              <!-- 비디오 목록 토글 버튼 -->
              <button
                @click="store.toggleVideoList"
                class="control-btn playlist-btn"
                :class="{ 'active': store.showVideoList }"
                title="비디오 목록"
              >
                <Icon name="mdi:playlist-play" class="control-icon" />
                <span class="control-text">목록</span>
              </button>
            </div>
            
            <!-- 공통 컨트롤 -->
            <button
              @click="store.toggleMinimize"
              class="control-btn minimize-btn"
              title="최소화/복원"
            >
              <Icon 
                :name="store.isMinimized ? 'mdi:arrow-expand' : 'mdi:minus'" 
                class="control-icon" 
              />
              <span class="control-text">{{ store.isMinimized ? '펼치기' : '최소화' }}</span>
            </button>
            
            <button
              @click="store.closePlayer"
              class="control-btn close-btn"
              title="닫기"
            >
              <Icon name="mdi:close" class="control-icon" />
              <span class="control-text">닫기</span>
            </button>
          </div>
        </div>

        <!-- 비디오/오디오 영역 -->
        <div class="media-container">
          <!-- 현재 재생 중인 비디오/오디오 -->
          <div 
            v-if="store.youtubeEmbedUrl && !store.showVideoList" 
            class="current-video"
            :class="{ 'audio-only': store.isMinimized }"
            :style="store.isMinimized ? {} : { height: `${store.size.height}px` }"
          >
            <iframe
              :src="store.youtubeEmbedUrl"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              class="youtube-iframe"
              :class="{ 'minimized-iframe': store.isMinimized }"
            ></iframe>
            
            <!-- 재생 컨트롤 (최소화되지 않았을 때만) -->
            <div v-if="!store.isMinimized" class="player-controls">
              <button
                @click="store.playPrevious"
                :disabled="!store.hasPrevious"
                class="control-btn-small"
                title="이전 비디오"
              >
                <Icon name="mdi:skip-previous" class="control-icon-small" />
              </button>
              
              <button
                @click="store.playNext"
                :disabled="!store.hasNext"
                class="control-btn-small"
                title="다음 비디오"
              >
                <Icon name="mdi:skip-next" class="control-icon-small" />
              </button>
            </div>
          </div>

          <!-- 비디오 목록 -->
          <div v-if="store.showVideoList && !store.isMinimized" class="video-list-container">
            <div v-if="store.isLoading" class="loading-state">
              <Icon name="mdi:loading" class="animate-spin" />
              <span>비디오 목록을 불러오는 중...</span>
            </div>
            
            <div v-else-if="store.videoList.length === 0" class="empty-state">
              <Icon name="mdi:video-off" />
              <span>비디오가 없습니다</span>
            </div>
            
            <div v-else class="video-list">
              <div
                v-for="(video, index) in store.videoList"
                :key="video.id"
                @dblclick="store.playVideoFromList(video, index)"
                class="video-item"
                :class="{ 'active': store.currentVideoIndex === index }"
              >
                <img
                  :src="video.thumbnail"
                  :alt="video.title"
                  class="video-thumbnail"
                />
                <div class="video-info">
                  <h4 class="video-title">{{ video.title }}</h4>
                  <p class="video-category">
                    {{ video.category?.name || '카테고리 없음' }}
                  </p>
                </div>
                <button
                  @click.stop="store.playVideoFromList(video, index)"
                  class="play-button"
                  :class="{ 'playing': store.currentVideoIndex === index }"
                  :title="store.currentVideoIndex === index ? '재생 중' : '재생'"
                >
                  <Icon 
                    :name="store.currentVideoIndex === index ? 'mdi:pause' : 'mdi:play'"
                    class="play-icon"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 리사이즈 핸들 -->
        <div
          v-if="!store.isMinimized"
          class="resize-handle"
          @mousedown="startResize"
        >
          <Icon name="mdi:resize-bottom-right" class="resize-icon" />
        </div>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<script setup>
import { computed, reactive, onMounted, onUnmounted, ref } from 'vue'
import { useFloatingPlayerStore } from '~/stores/floatingPlayer'

const store = useFloatingPlayerStore()

// 스로틀 헬퍼 함수
const throttle = (func, limit) => {
  let inThrottle
  let lastRan
  let lastFunc
  return function() {
    const context = this
    const args = arguments
    if (!inThrottle) {
      func.apply(context, args)
      lastRan = Date.now()
      inThrottle = true
    } else {
      clearTimeout(lastFunc)
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args)
          lastRan = Date.now()
        }
      }, limit - (Date.now() - lastRan))
    }
  }
}

// 드래그 관련 상태
const dragState = reactive({
  isDragging: false,
  isResizing: false,
  startX: 0,
  startY: 0,
  startPos: { x: 0, y: 0 },
  startSize: { width: 0, height: 0 },
  animationFrameId: null
})

// 플레이어 스타일 계산
const playerStyle = computed(() => {
  let height = 60 // 헤더 높이
  
  if (!store.isMinimized) {
    if (store.showVideoList) {
      height += 400 // 비디오 목록 높이
    } else {
      height += store.size.height // 비디오 높이
    }
  }
  
  return {
    position: 'fixed',
    left: `${store.position.x}px`,
    top: `${store.position.y}px`,
    width: `${store.size.width}px`,
    height: `${height}px`,
    zIndex: 9999,
    transition: store.isDragging ? 'none' : 'all 0.3s ease',
  }
})

// 마우스 다운 이벤트 처리
const handleMouseDown = (e) => {
  e.stopPropagation()
}

// 드래그 시작
const startDrag = (e) => {
  if (e.target.closest('.control-btn')) return
  
  dragState.isDragging = true
  dragState.startX = e.clientX
  dragState.startY = e.clientY
  dragState.startPos = { ...store.position }
  
  store.setDragging(true)
  
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
  
  e.preventDefault()
}

// 드래그 중
const handleDrag = (e) => {
  if (!dragState.isDragging) return
  
  // 이전 애니메이션 프레임 취소
  if (dragState.animationFrameId) {
    cancelAnimationFrame(dragState.animationFrameId)
  }
  
  // requestAnimationFrame으로 DOM 업데이트 최적화
  dragState.animationFrameId = requestAnimationFrame(() => {
    const deltaX = e.clientX - dragState.startX
    const deltaY = e.clientY - dragState.startY
    
    store.updatePosition(
      dragState.startPos.x + deltaX,
      dragState.startPos.y + deltaY
    )
  })
}

// 드래그 종료
const stopDrag = () => {
  dragState.isDragging = false
  store.setDragging(false)
  
  // 남은 애니메이션 프레임 취소
  if (dragState.animationFrameId) {
    cancelAnimationFrame(dragState.animationFrameId)
    dragState.animationFrameId = null
  }
  
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// 리사이즈 시작
const startResize = (e) => {
  dragState.isResizing = true
  dragState.startX = e.clientX
  dragState.startY = e.clientY
  dragState.startSize = { ...store.size }
  
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  
  e.preventDefault()
  e.stopPropagation()
}

// 리사이즈 중
const handleResize = (e) => {
  if (!dragState.isResizing) return
  
  // 이전 애니메이션 프레임 취소
  if (dragState.animationFrameId) {
    cancelAnimationFrame(dragState.animationFrameId)
  }
  
  // requestAnimationFrame으로 DOM 업데이트 최적화
  dragState.animationFrameId = requestAnimationFrame(() => {
    const deltaX = e.clientX - dragState.startX
    const deltaY = e.clientY - dragState.startY
    
    const newWidth = Math.max(400, dragState.startSize.width + deltaX)
    const newHeight = Math.max(225, Math.round(newWidth * 9 / 16))
    
    store.size.width = newWidth
    store.size.height = newHeight
  })
}

// 리사이즈 종료
const stopResize = () => {
  dragState.isResizing = false
  
  // 남은 애니메이션 프레임 취소
  if (dragState.animationFrameId) {
    cancelAnimationFrame(dragState.animationFrameId)
    dragState.animationFrameId = null
  }
  
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

// 윈도우 리사이즈 처리
const handleWindowResize = () => {
  store.updatePosition(store.position.x, store.position.y)
}

onMounted(() => {
  if (process.client) {
    window.addEventListener('resize', handleWindowResize)
  }
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('resize', handleWindowResize)
  }
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
})
</script>

<style scoped>
.floating-youtube-player {
  background: white;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  user-select: none;
  will-change: transform;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f3f4f6;
  cursor: move;
  user-select: none;
  border-bottom: 1px solid #e5e7eb;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.youtube-icon {
  color: #ef4444;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.title-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.control-btn {
  padding: 0.5rem 0.75rem;
  color: #374151;
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  white-space: nowrap;
}

.control-btn:hover {
  background: #e5e7eb;
  color: #1f2937;
  border-color: rgba(0, 0, 0, 0.15);
}

.control-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #2563eb;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.playlist-btn.active {
  background: #dbeafe;
  color: #1e40af;
  border-color: #3b82f6;
}

.playlist-btn.active:hover {
  background: #bfdbfe;
  color: #1e3a8a;
}

.minimize-btn {
  color: #059669;
}

.minimize-btn:hover {
  background: #d1fae5;
  color: #047857;
  border-color: rgba(5, 150, 105, 0.2);
}

.close-btn {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.05);
  border-color: rgba(220, 38, 38, 0.1);
}

.close-btn:hover {
  background: #fee2e2;
  color: #b91c1c;
  border-color: rgba(220, 38, 38, 0.2);
}

.control-icon {
  font-size: 1.125rem;
  color: currentColor;
  flex-shrink: 0;
}

.control-text {
  font-size: 0.75rem;
  font-weight: 500;
  color: currentColor;
}

.video-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.current-video {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000; /* 디버깅용: 검은 배경으로 영역 확인 */
}

.youtube-iframe {
  width: 100%;
  height: 100%;
  display: block;
  border: none;
  min-height: 281px;
}

.resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 1rem;
  height: 1rem;
  cursor: se-resize;
  background: linear-gradient(135deg, transparent 50%, #6b7280 50%);
  opacity: 0.3;
}

.resize-handle:hover {
  opacity: 0.6;
}

.resize-icon {
  color: #9ca3af;
  font-size: 1rem;
}

/* 비디오 목록 스타일 */
.video-list-container {
  height: 400px;
  overflow-y: auto;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6b7280;
  gap: 0.5rem;
}

.video-list {
  padding: 0.5rem;
}

.video-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: default;
  transition: all 0.2s ease;
  position: relative;
  border: 2px solid transparent;
  user-select: none;
}

.video-item:hover {
  background: #e5e7eb;
}

.video-item.active {
  background: #eff6ff;
  border: 2px solid #3b82f6;
  padding: calc(0.75rem - 1px);
}

.video-thumbnail {
  width: 60px;
  height: 45px;
  object-fit: cover;
  border-radius: 0.25rem;
  flex-shrink: 0;
}

.video-info {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.video-info:hover .video-title {
  text-decoration: underline;
}

.video-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-category {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

.play-button {
  padding: 0.75rem;
  background: #3b82f6;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.play-button:hover {
  background: #2563eb;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.play-button:active {
  transform: scale(0.95);
}

.play-button.playing {
  background: #10b981;
}

.play-button.playing:hover {
  background: #059669;
}

.play-icon {
  color: white;
  font-size: 1.25rem;
}

/* 재생 컨트롤 */
.player-controls {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.25rem;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 0.5rem;
  padding: 0.25rem;
}

.control-btn-small {
  padding: 0.5rem;
  background: transparent;
  border: none;
  color: white;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-btn-small:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.control-btn-small:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-icon-small {
  font-size: 1rem;
}

/* 미디어 컨테이너 */
.media-container {
  position: relative;
  width: 100%;
}

/* 오디오 전용 모드 */
.current-video.audio-only {
  height: 0 !important;
  overflow: hidden;
}

.youtube-iframe.minimized-iframe {
  position: absolute;
  left: -9999px;
  top: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

/* 최소화 시 컨트롤 */
.minimized-controls,
.normal-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.audio-control {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.audio-control:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
}

.audio-control:disabled {
  opacity: 0.3;
  background: rgba(239, 68, 68, 0.05);
}

/* 모바일 반응형 */
@media (max-width: 480px) {
  .control-text {
    display: none;
  }
  
  .control-btn {
    padding: 0.5rem;
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .floating-youtube-player {
    background: #1f2937;
    border-color: #4b5563;
  }
  
  .header {
    background: #374151;
    border-bottom-color: #4b5563;
  }
  
  .title-text {
    color: #f9fafb;
  }
  
  .control-btn {
    color: #e5e7eb;
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
  }
  
  .control-btn:hover {
    background: #4b5563;
    color: #f9fafb;
    border-color: rgba(255, 255, 255, 0.25);
  }
  
  .close-btn {
    background: rgba(220, 38, 38, 0.1);
    border-color: rgba(220, 38, 38, 0.2);
  }
  
  .close-btn:hover {
    background: #7f1d1d;
    color: #fecaca;
    border-color: rgba(220, 38, 38, 0.3);
  }
  
  .video-list-container {
    background: #374151;
    border-top-color: #4b5563;
  }
  
  .video-item:hover {
    background: #4b5563;
  }
  
  .video-item.active {
    background: #1e3a8a;
    border-color: #3b82f6;
    padding: calc(0.75rem - 1px);
  }
  
  .video-title {
    color: #f9fafb;
  }
  
  .video-category {
    color: #d1d5db;
  }
  
  .loading-state,
  .empty-state {
    color: #d1d5db;
  }
  
  .play-button {
    background: #3b82f6;
  }
  
  .play-button:hover {
    background: #2563eb;
  }
  
  .play-button.playing {
    background: #10b981;
  }
  
  .play-button.playing:hover {
    background: #059669;
  }
}
</style>