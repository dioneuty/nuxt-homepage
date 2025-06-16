// composables/useImages.js
import { ref } from 'vue'
import { carouselImages } from '~/server/data/images'

/**
 * 이미지 데이터를 가져오는 컴포저블
 * @returns {Object} - 이미지 데이터
 */
export function useImages() {
  /**
   * 캐러셀에 사용될 이미지 목록을 반환합니다.
   * @returns {Ref<Array<Object>>} - 캐러셀 이미지 배열의 반응형 참조
   */
  function getCarouselImages() {
    return ref(carouselImages)
  }

  return {
    getCarouselImages
  }
}