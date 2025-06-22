<template>
  <div class="post-list glass-list-effect">
    <div :class="['post-list-header text-white flex items-center', headerColorClass]">
      <slot name="icon"></slot>
      <h2 class="font-semibold">{{ title }}</h2>
    </div>
    <ul class="divide-y divide-gray-100 dark:divide-gray-700">
      <li v-for="post in posts" :key="post.id" class="post-list-item hover:bg-gray-50 dark:hover:bg-gray-700">
        <NuxtLink :to="`/${type}?id=${post.id}`" class="block">
          <div class="flex justify-between items-center">
            <span class="text-gray-900 dark:text-gray-100 truncate">
              <span v-if="post.parentId" class="mr-2 text-gray-500">↳</span>
              {{ post.title }}
            </span>
            <span class="text-gray-500 dark:text-gray-400 text-xs">{{ formatDate(post.createdAt) }}</span>
          </div>
        </NuxtLink>
      </li>
    </ul>
    <!-- TODO: JGM 무한 스크롤 기능 추가
    - Intersection Observer API를 사용하여 스크롤이 하단에 도달했을 때 감지
    - 새 게시물을 불러오는 로딩 상태 표시
    - API 호출을 통해 다음 페이지의 게시물 데이터 가져오기
    - 가져온 데이터를 기존 `posts` 배열에 추가
    - 모든 게시물을 불러왔을 때 추가 로딩 방지 로직 구현
    -->
  </div>
</template>

<script setup>
import { formatDate } from '~/utils/dateFormatter'

defineProps({
  title: String,
  posts: Array,
  type: String,
  headerColorClass: String
})
</script>

<style scoped>
.post-list-header {
  @apply px-3 py-2 text-sm;
}
.post-list-item {
  @apply px-3 py-2;
}
.post-list-item a {
  @apply block;
}

.glass-list-effect {
  /* Light mode styles - Dark Ghostwhite toned Glass with Gradient */
  background: linear-gradient(135deg, rgba(70, 75, 80, 0.15), rgba(50, 55, 60, 0.15));
  backdrop-filter: blur(5px);
  border-radius: 10px;
  border: 1px solid rgba(70, 75, 80, 0.3);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dark .glass-list-effect {
  /* Dark mode styles - Existing Dark Glass */
  background-color: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>