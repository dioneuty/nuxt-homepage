<template>
  <div class="mt-10">
    <!-- 카테고리 선택 드롭다운 -->
    <select 
      v-model="selectedCategory" 
      @change="onCategoryChange"
      class="w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
    >
      <!-- 전체 카테고리 옵션 -->
      <option value="0">전체 카테고리</option>
      <!-- 개별 카테고리 옵션들 -->
      <option v-for="category in categories" :key="category.id" :value="category.id"
              :class="{ 'font-bold': isSelected(category.id) }">
        {{ category.name }} ({{ category.post_count }})
      </option>
    </select>

    <!-- 카테고리 편집 링크 -->
    <NuxtLink 
      to="/blog/edit-categories"
      class="block w-full text-center py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 ease-in-out"
    >
      카테고리 편집
    </NuxtLink>
  </div>
</template>
  
<script setup>
// 필요한 Vue 컴포저블 import
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
  
// props 정의: 카테고리 배열을 필수값으로 받음
defineProps({
  categories: {
    type: Array,
    required: true
  }
})
  
// 라우터 관련 설정
const route = useRoute()
const router = useRouter()
  
// 현재 선택된 카테고리 (URL 쿼리에서 가져오거나 기본값 '0' 사용)
const selectedCategory = ref(route.query.category || '0')
  
// 카테고리 변경 시 URL 쿼리 파라미터 업데이트
function onCategoryChange() {
  if (selectedCategory.value === '0') {
    // 전체 카테고리 선택 시 category 쿼리 파라미터 제거
    router.push({ query: { ...route.query, category: undefined } })
  } else {
    // 특정 카테고리 선택 시 해당 카테고리 ID로 쿼리 파라미터 설정
    router.push({ query: { ...route.query, category: selectedCategory.value } })
  }
}
  
// URL의 카테고리 쿼리 파라미터 변경 감지
watch(() => route.query.category, (newCategory) => {
  selectedCategory.value = newCategory || '0'
})

// 현재 카테고리가 선택되었는지 확인하는 함수
function isSelected(categoryId) {
  return selectedCategory.value === categoryId.toString()
}
</script>

<style scoped>
/* 선택된 옵션의 스타일 */
select option:checked {
  font-weight: bold;
  background-color: #3b82f6;
  color: white;
}
</style>