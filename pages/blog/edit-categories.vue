<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-gray-800 dark:text-white">카테고리 편집</h1>
    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <ul class="space-y-4">
        <li v-for="(category, index) in categories" :key="index" class="flex items-center justify-between">
          <div class="flex-grow mr-4">
            <input 
              v-model="category.name" 
              type="text" 
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
            <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">({{ category.post_count }})</span>
          </div>
          <button @click="removeCategory(index)" class="text-red-500 hover:text-red-700">삭제</button>
        </li>
      </ul>
      <div class="mt-6 flex items-center">
        <input 
          v-model="newCategory" 
          type="text" 
          placeholder="새 카테고리 이름" 
          class="flex-grow mr-4 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
        <button @click="addCategory" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">추가</button>
      </div>
      <div class="mt-6 flex justify-end">
        <button @click="saveCategories" class="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600">저장</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const categories = ref([])
const newCategory = ref('')

// 카테고리 불러오기
const fetchCategories = async () => {
  const { data } = await useFetch('/api/categories')
  categories.value = data.value
}

// 컴포넌트 마운트 시 카테고리 불러오기
onMounted(fetchCategories)

const addCategory = () => {
  if (newCategory.value.trim()) {
    categories.value.push({ 
      name: newCategory.value.trim(), 
      slug: newCategory.value.trim().toLowerCase().replace(/ /g, '-'),
      post_count: 0
    })
    newCategory.value = ''
  }
}

const removeCategory = (index) => {
  categories.value.splice(index, 1)
}

const saveCategories = async () => {
  const { error } = await useFetch('/api/categories', {
    method: 'PUT',
    body: categories.value
  })

  if (error.value) {
    alert('카테고리 저장에 실패했습니다.')
  } else {
    alert('카테고리가 성공적으로 저장되었습니다.')
    await fetchCategories()  // 저장 후 카테고리 목록 새로고침
  }
}
</script>