<template>
  <div class="container mx-auto px-4 py-8 max-w-[2560px]">
    <h1 class="text-3xl font-bold mb-6 dark:text-white flex items-center">
      <Icon icon="mdi:image-multiple" class="mr-2" />
      미디어 갤러리
    </h1>
    
    <!-- 검색 바 -->
    <div class="mb-6 relative">
      <Icon icon="mdi:magnify" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="검색..." 
        class="w-full p-2 pl-10 border rounded-md dark:bg-gray-700 dark:text-white"
      >
    </div>

    <!-- 갤러리 masonry 레이아웃 -->
    <div class="masonry-layout">
      <div v-for="item in filteredItems" :key="item.id" class="masonry-item mb-4 break-inside-avoid">
        <div class="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg relative">
          <img :src="item.imageUrl" :alt="item.title" class="w-full h-48 object-cover">
          <div class="p-4">
            <h2 class="text-xl font-bold mb-2 dark:text-white flex items-center">
              <Icon icon="mdi:image" class="mr-2" />
              {{ item.title }}
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-4 flex items-center">
              <Icon icon="mdi:information-outline" class="mr-2" />
              {{ item.description }}
            </p>
            <div class="flex flex-wrap gap-2">
              <span v-for="tag in item.tags" :key="tag" class="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs flex items-center">
                <Icon icon="mdi:tag" class="mr-1" />
                {{ tag }}
              </span>
            </div>
          </div>
          <!-- 댓글 알림 박스 -->
          <div class="absolute bottom-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
            <Icon icon="mdi:comment-outline" class="mr-1" />
            {{ item.comments }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'

// 갤러리 아이템 데이터 (실제로는 API에서 가져올 것입니다)
const items = ref([
  { id: 1, title: '산과 호수', description: '아름다운 자연 풍경', imageUrl: '/images/home-repair.jpg', likes: 10, comments: 5, tags: ['photography', 'nature', 'landscape'] },
  { id: 2, title: '도시 야경', description: '빛나는 도시의 밤', imageUrl: '/images/home-repair.jpg', likes: 15, comments: 3, tags: ['cityscape', 'night'] },
  { id: 3, title: '도시 야경', description: '빛나는 도시의 밤', imageUrl: '/images/home-repair.jpg', likes: 15, comments: 3, tags: ['cityscape', 'night'] },
  { id: 4, title: '도시 야경', description: '빛나는 도시의 밤', imageUrl: '/images/home-repair.jpg', likes: 15, comments: 3, tags: ['cityscape', 'night'] },
  { id: 5, title: '도시 야경', description: '빛나는 도시의 밤', imageUrl: '/images/home-repair.jpg', likes: 15, comments: 3, tags: ['cityscape', 'night'] },
  { id: 1, title: '산과 호수', description: '아름다운 자연 풍경', imageUrl: '/images/home-repair.jpg', likes: 10, comments: 5, tags: ['photography', 'nature', 'landscape'] },
  { id: 2, title: '도시 야경', description: '빛나는 도시의 밤', imageUrl: '/images/home-repair.jpg', likes: 15, comments: 3, tags: ['cityscape', 'night'] },
  { id: 3, title: '도시 야경', description: '빛나는 도시의 밤', imageUrl: '/images/home-repair.jpg', likes: 15, comments: 3, tags: ['cityscape', 'night'] },
  { id: 4, title: '도시 야경', description: '빛나는 도시의 밤', imageUrl: '/images/home-repair.jpg', likes: 15, comments: 3, tags: ['cityscape', 'night'] },
  { id: 5, title: '도시 야경', description: '빛나는 도시의 밤', imageUrl: '/images/home-repair.jpg', likes: 15, comments: 3, tags: ['cityscape', 'night'] },
  { id: 1, title: '산과 호수', description: '아름다운 자연 풍경', imageUrl: '/images/home-repair.jpg', likes: 10, comments: 5, tags: ['photography', 'nature', 'landscape'] },
  { id: 2, title: '도시 야경', description: '빛나는 도시의 밤', imageUrl: '/images/home-repair.jpg', likes: 15, comments: 3, tags: ['cityscape', 'night'] },
  { id: 3, title: '도시 야경', description: '빛나는 도시의 밤', imageUrl: '/images/home-repair.jpg', likes: 15, comments: 3, tags: ['cityscape', 'night'] },
  { id: 4, title: '도시 야경', description: '빛나는 도시의 밤', imageUrl: '/images/home-repair.jpg', likes: 15, comments: 3, tags: ['cityscape', 'night'] },
  { id: 5, title: '도시 야경', description: '빛나는 도시의 밤', imageUrl: '/images/home-repair.jpg', likes: 15, comments: 3, tags: ['cityscape', 'night'] },
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