// composables/useImages.js
import { ref } from 'vue'
import { carouselImages } from '~/server/data/images'

/**
 * 이미지 데이터를 가져오는 컴포저블
 * @returns {Object} - 이미지 데이터
 */
export function useImages() {
  function getCarouselImages() {
    return ref(carouselImages)
  }

  return {
    getCarouselImages
  }
}