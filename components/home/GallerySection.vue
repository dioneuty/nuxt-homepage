<template>
  <div class="gallery-section">
    <h2 class="gallery-title">
      <Icon icon="mdi:image-multiple" class="icon-large mr-2" />
      갤러리
    </h2>
    <div class="gallery-grid">
      <div v-for="item in galleryItems.slice(0, 10)" :key="item.id" class="gallery-item" @click="openGalleryModal(item)">
        <div v-html="item.content" class="gallery-image"></div>
        <div class="gallery-overlay">
          <Icon icon="mdi:magnify-plus" class="text-white icon-large" />
        </div>
      </div>
    </div>
    <NuxtLink to="/gallery" class="btn-purple mt-6">
      <Icon icon="mdi:chevron-right" class="icon-small mr-2" />
      더 보기
    </NuxtLink>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { useGalleryStore } from '@/stores/galleryStore' // Pinia 스토어 import

const { data: galleryItems } = await useFetch('/api/gallery')
const galleryStore = useGalleryStore()

/**
 * 갤러리 모달을 여는 함수입니다.
 * Pinia 스토어를 사용하여 선택된 갤러리 항목을 설정합니다.
 * @param {object} item - 열고자 하는 갤러리 항목 객체.
 */
const openGalleryModal = (item) => {
  galleryStore.setSelectedItem(item)
}
</script>