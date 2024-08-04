// composables/useImages.js
import { ref } from 'vue'
import { carouselImages } from '~/server/data/images'

export function useImages() {
  const getCarouselImages = () => ref(carouselImages)

  return {
    getCarouselImages
  }
}