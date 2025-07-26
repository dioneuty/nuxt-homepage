<template>
  <YouTubeEditCategory />
</template>

<script setup>
import { useYoutubeCategoryStore } from '~/stores/youtubeCategoryStore'
import { storeToRefs } from 'pinia'
import YouTubeEditCategory from '~/components/youtubeGallery/YouTubeEditCategory.vue'

// 페이지 메타데이터 설정
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

// 페이지 제목 설정
useHead({
  title: 'YouTube 카테고리 관리'
})

// YouTube 카테고리 스토어
const youtubeCategoryStore = useYoutubeCategoryStore()
const { activeCategory } = storeToRefs(youtubeCategoryStore)
</script>