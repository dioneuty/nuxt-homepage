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

/**
 * @function useToast
 * @description 토스트 메시지를 관리하는 컴포저블 함수입니다.
 * @returns {Object} 토스트 메시지 관련 함수와 상태
 * @property {Ref<ToastItem[]>} toasts - 토스트 메시지 배열
 * @property {function(string, 'success'|'error'|'warning'|'info', number): void} showToast - 토스트 메시지 표시 함수
 * @property {function(number): void} removeToast - 토스트 메시지 제거 함수
 */
export function useToast() {
  /**
   * @function showToast
   * @description 토스트 메시지를 표시합니다.
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

  /**
   * @function removeToast
   * @description 토스트 메시지를 제거합니다.
   * @param {number} id - 제거할 토스트 메시지의 ID
   */
  const removeToast = (id) => {
    toasts.value = toasts.value.filter(toast => toast.id !== id);
  };

  return {
    // 1. 토스트 메시지 관련 상태
    toasts, // 토스트 메시지 배열

    // 2. 토스트 메시지 관련 함수
    showToast, // 토스트 메시지 표시 함수
    removeToast, // 토스트 메시지 제거 함수
  };
} 