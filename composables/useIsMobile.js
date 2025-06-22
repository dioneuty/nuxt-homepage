import { ref, onMounted, onUnmounted } from 'vue'

/**
 * @function useIsMobile
 * @description 모바일 환경 여부를 확인하는 컴포저블 함수입니다.
 * @returns {Object} 모바일 환경 여부 관련 함수와 상태
 * @property {Ref<boolean>} isMobile - 모바일 환경 여부
 */
export function useIsMobile() {
  const isMobile = ref(false) // 모바일 환경 여부

  /**
   * @function checkMobile
   * @description 모바일 환경 여부를 확인하는 함수
   */
  const checkMobile = () => {
    isMobile.value = window.matchMedia('(max-width: 768px)').matches
  }

  /**
   * @function onMounted
   * @description 컴포넌트가 마운트될 때 실행되는 함수
   */
  onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
  })

  /**
   * @function onUnmounted
   * @description 컴포넌트가 언마운트될 때 실행되는 함수
   */
  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })

  return {
    // 1. 모바일 환경 여부 관련 상태
    isMobile, // 모바일 환경 여부

    // 2. 모바일 환경 여부 관련 함수
    checkMobile, // 모바일 환경 여부를 확인하는 함수
  }
} 