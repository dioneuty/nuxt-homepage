<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 dark:text-white">카테고리 편집</h1>
    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-6">
      <div class="mb-4 flex">
        <input 
          v-model="newCategory" 
          @keyup.enter="addCategory" 
          placeholder="새 카테고리 이름" 
          class="flex-grow p-2 border rounded dark:bg-gray-700 dark:text-white mr-2"
        >
        <button 
          @click="addCategory" 
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          추가
        </button>
      </div>
      <ul class="mb-4">
        <li v-for="(category, index) in categories" :key="index" class="mb-2 flex items-center">
          <input 
            v-model="category.name" 
            class="flex-grow p-2 border rounded dark:bg-gray-700 dark:text-white mr-2"
          >
          <span class="mr-2 text-gray-600 dark:text-gray-400">
            ({{ category.post_count || 0 }})
          </span>
          <button 
            @click="removeCategory(index)" 
            class="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
          >
            삭제
          </button>
        </li>
      </ul>
    </div>
    <div class="flex justify-between">
      <button 
        @click="cancelEdit" 
        class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
      >
        취소
      </button>
      <button 
        @click="saveCategories" 
        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        저장
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const categories = ref([])
const newCategory = ref('')
const deletedCategories = ref([])

// 카테고리 불러오기
const fetchCategories = async () => {
  const { data } = await useFetch('/api/categories')
  categories.value = data.value.filter(cat => cat.id !== 'all')
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
  const removedCategory = categories.value.splice(index, 1)[0]
  if (removedCategory.id) {
    deletedCategories.value.push(removedCategory.id)
  }
}

const saveCategories = async () => {
  const { error } = await useFetch('/api/categories', {
    method: 'PUT',
    body: { categories: categories.value, deletedCategories: deletedCategories.value }
  })

  if (error.value) {
    alert('카테고리 저장에 실패했습니다.')
  } else {
    alert('카테고리가 성공적으로 저장되었습니다.')
    router.push('/blog')
  }
}

const cancelEdit = () => {
  router.push('/blog')
}
</script>