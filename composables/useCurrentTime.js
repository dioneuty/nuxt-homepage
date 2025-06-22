import { ref, onMounted, onUnmounted } from 'vue';

export function useCurrentTime() {
  const currentTime = ref('');
  let intervalId = null;

  const updateTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    currentTime.value = `${hours}:${minutes}:${seconds}`;
  };

  onMounted(() => {
    updateTime(); // 컴포넌트 마운트 시 즉시 시간 업데이트
    intervalId = setInterval(updateTime, 1000); // 1초마다 시간 업데이트
  });

  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId); // 컴포넌트 언마운트 시 인터벌 정리
    }
  });

  return { currentTime };
} 