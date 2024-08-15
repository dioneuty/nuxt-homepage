<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8 max-w-4xl mx-auto">
      <Carousel :images="images" />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <PostList 
        title="최신 블로그 포스트" 
        :posts="blogPosts" 
        type="blog"
        headerColorClass="bg-blue-600"
      >
        <template #icon>
          <Icon icon="mdi:post-outline" class="w-6 h-6 mr-2" />
        </template>
      </PostList>
      <PostList 
        title="최신 게시판 글" 
        :posts="boardPosts.posts" 
        type="board"
        headerColorClass="bg-green-600"
      >
        <template #icon>
          <Icon icon="mdi:forum-outline" class="w-6 h-6 mr-2" />
        </template>
      </PostList>
    </div>
    <div class="mt-12 text-center">
      <h2 class="text-2xl font-bold mb-4 flex items-center justify-center text-gray-800 dark:text-white">
        <Icon icon="mdi:image-multiple" class="w-8 h-8 mr-2 text-gray-800 dark:text-white" />
        갤러리
      </h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div v-for="(image, index) in images.slice(0, 10)" :key="index" class="relative group">
          <img :src="image" :alt="`Gallery image ${index + 1}`" class="w-full h-40 object-cover rounded-lg transition-transform duration-300 transform group-hover:scale-105">
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import Carousel from '@/components/Carousel.vue'
import PostList from '@/components/PostList.vue'

// 각 API에서 데이터 가져오기
const { data: blogPosts } = await useFetch('/api/blogPosts')
const { data: boardPosts } = await useFetch('/api/boardPosts')
const images = ref([
  'images/foods/02622-2946913328-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02627-3520537961-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02628-969862558-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02631-1493736721-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02632-1910364399-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02633-1183833072-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02635-2468241200-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02636-2010697720-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02638-138639311-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02639-3506920034-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02641-464823937-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02642-3197523906-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02644-2095761223-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02645-2150047310-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02646-277971245-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02647-2981120122-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02648-612170913-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02652-2595417360-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02654-2797699637-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02658-588456811-intricate details, ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), phys.webp',
  'images/foods/02666-1339467618-intricate details, ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), phys.webp',
  'images/foods/02670-2708671754-intricate details, ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), phys.webp',
])

definePageMeta({
  layout: 'default'
})
</script>

<style scoped>
.text-shadow {
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}
</style>