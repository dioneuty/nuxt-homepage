<template>
  <div class="container mx-auto px-4 py-8 max-w-[2560px]">
    <h1 class="text-3xl font-bold mb-6 dark:text-white">미디어 갤러리</h1>
    
    <!-- 검색 바 -->
    <div class="mb-6">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="검색..." 
        class="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
      >
    </div>

    <!-- 갤러리 masonry 레이아웃 -->
    <div class="masonry-layout">
      <div v-for="item in filteredItems" :key="item.id" class="masonry-item mb-4 break-inside-avoid">
        <div class="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          <img :src="item.imageUrl" :alt="item.title" class="w-full object-cover">
          <div class="p-4">
            <h2 class="text-lg font-semibold dark:text-white">{{ item.title }}</h2>
            <p class="text-sm text-gray-600 dark:text-gray-300">{{ item.description }}</p>
            <div class="mt-2 flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ item.likes }} 좋아요</span>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ item.comments }} 댓글</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 갤러리 아이템 데이터 (실제로는 API에서 가져올 것입니다)
const items = ref([
  { id: 1, title: '산과 호수', description: '아름다운 자연 풍경', imageUrl: '/images/home-repair.jpg', likes: 10, comments: 5 },
  { id: 2, title: '도시 야경', description: '빛나는 도시의 밤ㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴ', imageUrl: '/images/home-repair.jpg', likes: 15, comments: 3 },
  { id: 3, title: '도시 야경', description: '빛나는 도시의 밤', imageUrl: '/images/home-repair.jpg', likes: 15, comments: 3 },
  { id: 4, title: '도시 야경', description: '빛나는 도시의 밤ㄴㄴㄴㄴㄴ', imageUrl: '/images/home-repair.jpg', likes: 15, comments: 3 },
  { id: 5, title: '도시 야경', description: '빛나는 도시의 밤', imageUrl: '/images/home-repair.jpg', likes: 15, comments: 3 },
  { id: 1, title: '산과 호수', description: '아름다운 자연 풍경', imageUrl: '/images/home-repair.jpg', likes: 10, comments: 5 },
  { id: 2, title: '도시 야경', description: '빛나는 도시의 밤ㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴ', imageUrl: '/images/home-repair.jpg', likes: 15, comments: 3 },
  { id: 3, title: '도시 야경', description: '빛나는 도시의 밤', imageUrl: '/images/home-repair.jpg', likes: 15, comments: 3 },
  { id: 4, title: '도시 야경', description: '빛나는 도시의 밤ㄴㄴㄴㄴㄴ', imageUrl: '/images/home-repair.jpg', likes: 15, comments: 3 },
  { id: 5, title: '도시 야경', description: '빛나는 도시의 밤', imageUrl: '/images/home-repair.jpg', likes: 15, comments: 3 },
  { id: 1, title: '산과 호수', description: '아름다운 자연 풍경', imageUrl: '/images/home-repair.jpg', likes: 10, comments: 5 },
  { id: 2, title: '도시 야경', description: '빛나는 도시의 밤ㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴ', imageUrl: '/images/home-repair.jpg', likes: 15, comments: 3 },
  { id: 3, title: '도시 야경', description: '빛나는 도시의 밤', imageUrl: '/images/home-repair.jpg', likes: 15, comments: 3 },
  { id: 4, title: '도시 야경', description: '빛나는 도시의 밤ㄴㄴㄴㄴㄴ', imageUrl: '/images/home-repair.jpg', likes: 15, comments: 3 },
  { id: 5, title: '도시 야경', description: '빛나는 도시의 밤', imageUrl: '/images/home-repair.jpg', likes: 15, comments: 3 },
  // ... 더 많은 아이템
])

const searchQuery = ref('')

const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value
  return items.value.filter(item => 
    item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

definePageMeta({
  layout: 'default'
})
</script>

<style scoped>
.masonry-layout {
  column-count: 1;
  column-gap: 1rem;
}

.masonry-item {
  display: inline-block;
  width: 100%;
}

@media (min-width: 640px) {
  .masonry-layout {
    column-count: 2;
  }
}

@media (min-width: 768px) {
  .masonry-layout {
    column-count: 2;
  }
}

@media (min-width: 1024px) {
  .masonry-layout {
    column-count: 3;
  }
}

@media (min-width: 1280px) {
  .masonry-layout {
    column-count: 4;
  }
}

@media (min-width: 1536px) {
  .masonry-layout {
    column-count: 4;
  }
}

@media (min-width: 1920px) {
  .masonry-layout {
    column-count: 5;
  }
}

@media (min-width: 2560px) {
  .masonry-layout {
    column-count: 6;
  }
}

@media (min-width: 3000px) {
  .masonry-layout {
    column-count: 7;
  }
}

@media (min-width: 3840px) {
  .masonry-layout {
    column-count: 8;
  }
}

</style>