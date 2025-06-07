import { ref } from 'vue';

/**
 * @typedef {Object} ToastItem
 * @property {number} id
 * @property {string} message
 * @property {'success'|'error'|'warning'|'info'} type
 * @property {number} duration
 * @property {NodeJS.Timeout | null} timeoutId
 */

/** @type {import('vue').Ref<ToastItem[]>} */
const toasts = ref([]);
let toastId = 0;
let currentTimeout = null;

export function useToast() {
  /**
   * @param {string} message
   * @param {'success'|'error'|'warning'|'info'} [type='success']
   * @param {number} [duration=5000]
   */
  const showToast = (message, type = 'success', duration = 5000) => {
    // 이전 토스트가 있으면 모두 제거하고 타이머 클리어
    if (currentTimeout) {
      clearTimeout(currentTimeout);
      currentTimeout = null;
    }
    toasts.value = []; // 기존 토스트 모두 제거

    const newToast = {
      id: toastId++,
      message,
      type,
      duration,
      timeoutId: null,
    };

    toasts.value.push(newToast);

    // 지정된 시간 후에 토스트 자동 제거
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