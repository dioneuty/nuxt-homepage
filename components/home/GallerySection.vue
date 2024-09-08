<template>
  <div class="mt-12 text-center">
    <h2 class="text-2xl font-bold mb-4 flex items-center justify-center text-gray-800 dark:text-white">
      <Icon icon="mdi:image-multiple" class="w-8 h-8 mr-2 text-gray-800 dark:text-white" />
      갤러리
    </h2>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <div v-for="item in galleryItems.slice(0, 10)" :key="item.id" class="relative group aspect-square" @click="openGalleryModal(item)">
        <div v-html="item.content" class="w-full h-full object-cover rounded-lg transition-transform duration-300 transform group-hover:scale-105 cursor-pointer overflow-hidden"></div>
        <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg">
          <Icon icon="mdi:magnify-plus" class="text-white w-8 h-8" />
        </div>
      </div>
    </div>
    <NuxtLink to="/gallery" class="inline-flex items-center mt-6 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-300">
      <Icon icon="mdi:chevron-right" class="w-5 h-5 mr-2" />
      더 보기
    </NuxtLink>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { useGalleryStore } from '@/stores/galleryStore' // Pinia 스토어 import

const { data: galleryItems } = await useFetch('/api/gallery')
const galleryStore = useGalleryStore()

const openGalleryModal = (item) => {
  galleryStore.setSelectedItem(item)
}
</script>