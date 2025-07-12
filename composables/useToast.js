import { ref } from 'vue';

const toasts = ref([]);
let toastId = 0;
let currentTimeout = null;

// 토스트 메시지 관리 컴포저블
export function useToast() {
  const showToast = (message, type = 'success', duration = 5000) => {
    // 이전 토스트 제거
    if (currentTimeout) {
      clearTimeout(currentTimeout);
      currentTimeout = null;
    }
    toasts.value = [];

    const newToast = {
      id: toastId++,
      message,
      type,
      duration,
      timeoutId: null,
    };

    toasts.value.push(newToast);

    // 자동 제거
    currentTimeout = setTimeout(() => {
      removeToast(newToast.id);
      currentTimeout = null;
    }, duration);
  };

  const removeToast = (id) => {
    toasts.value = toasts.value.filter(toast => toast.id !== id);
  };

  return {
    toasts,
    showToast,
    removeToast,
  };
} 