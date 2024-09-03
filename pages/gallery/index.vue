<template>
  <div class="container mx-auto px-4 py-8 max-w-[2560px]">
    <h1 class="text-3xl font-bold mb-6 dark:text-white flex items-center">
      <Icon icon="mdi:image-multiple" class="mr-2" />
      미디어 갤러리
    </h1>
    
    <GalleryList :apiEndpoint="apiEndpoint" />
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import GalleryList from '~/components/gallery/GalleryList.vue'

definePageMeta ({
  title: '미디어 갤러리 - Dion',
  meta: [
    { name: 'description', content: 'Dion - 미디어 갤러리' },
    { name: 'keywords', content: 'Dion, 미디어 갤러리' }
  ]
})

const apiEndpoint = '/api/gallery'
</script>