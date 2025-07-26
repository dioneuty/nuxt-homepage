<template>
  <ClientOnly>
    <Teleport to="body">
      <!-- 플로팅 유튜브 버튼 -->
      <div
        v-if="!store.isVisible"
        class="floating-youtube-button"
        @click="openVideoList"
        title="YouTube 플레이어 열기"
      >
        <Icon name="mdi:youtube" class="youtube-icon" />
        <span class="button-text">YouTube</span>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<script setup>
import { useFloatingPlayerStore } from '~/stores/floatingPlayer'

const store = useFloatingPlayerStore()

const openVideoList = () => {
  // 플레이어를 열고 바로 비디오 목록을 표시
  store.isVisible = true
  store.showVideoList = true
  store.isMinimized = false
  
  // 비디오 목록이 없으면 로드
  if (store.videoList.length === 0) {
    store.loadVideoList()
  }
}
</script>

<style scoped>
.floating-youtube-button {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: #dc2626;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 3rem;
  cursor: pointer;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 15px rgba(220, 38, 38, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 9998;
  user-select: none;
  font-weight: 600;
}

.floating-youtube-button:hover {
  background: #b91c1c;
  transform: translateY(-2px);
  box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.4), 0 8px 25px rgba(185, 28, 28, 0.8);
  border-color: rgba(255, 255, 255, 0.3);
}

.floating-youtube-button:active {
  transform: translateY(0);
  box-shadow: 0 8px 20px -5px rgba(0, 0, 0, 0.3), 0 4px 15px rgba(185, 28, 28, 0.6);
}

.youtube-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.button-text {
  font-size: 0.875rem;
  white-space: nowrap;
}

/* 모바일에서는 텍스트 숨기기 */
@media (max-width: 640px) {
  .floating-youtube-button {
    padding: 1rem;
    border-radius: 50%;
  }
  
  .button-text {
    display: none;
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .floating-youtube-button {
    background: #dc2626;
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 4px 15px rgba(220, 38, 38, 0.7);
  }
  
  .floating-youtube-button:hover {
    background: #b91c1c;
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.6), 0 8px 25px rgba(185, 28, 28, 0.9);
  }
}
</style>