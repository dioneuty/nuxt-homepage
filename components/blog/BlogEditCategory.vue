<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 dark:text-white">{{ title }}</h1>
    <div v-if="pending" class="flex justify-center items-center h-64">
      <Icon icon="eos-icons:loading" class="text-blue-500" width="48" height="48" />
    </div>
    <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
      <p class="font-bold">에러 발생</p>
      <p>{{ error }}</p>
    </div>
    <div v-else class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-6">
      <div class="mb-4 flex">
        <input 
          v-model="newCategory" 
          @keyup.enter="addCategory" 
          :placeholder="newCategoryPlaceholder" 
          class="flex-grow p-2 border rounded dark:bg-gray-700 dark:text-white mr-2"
        >
        <button 
          @click="addCategory" 
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {{ addButtonText }}
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
            {{ removeButtonText }}
          </button>
        </li>
      </ul>
    </div>
    <div class="flex justify-between">
      <button 
        @click="cancelEdit" 
        class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
      >
        {{ cancelButtonText }}
      </button>
      <button 
        @click="saveCategories" 
        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        {{ saveButtonText }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useModal } from '~/composables/useModal'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  title: { type: String, default: '카테고리 편집' },
  newCategoryPlaceholder: { type: String, default: '새 카테고리 이름' },
  addButtonText: { type: String, default: '추가' },
  removeButtonText: { type: String, default: '삭제' },
  cancelButtonText: { type: String, default: '취소' },
  saveButtonText: { type: String, default: '저장' },
  apiEndpoint: { type: String, required: true }
})

const { openModal } = useModal()

const categories = ref([])
const newCategory = ref('')
const deletedCategories = ref([])
const pending = ref(false)
const error = ref(null)

onMounted(async () => {
  pending.value = true
  try {
    const { data } = await useFetch(props.apiEndpoint)
    categories.value = data.value.filter(category => category.id !== 'all')
  } catch (e) {
    error.value = e
  } finally {
    pending.value = false
  }
})

function addCategory() {
  if (newCategory.value.trim()) {
    categories.value.push({ 
      name: newCategory.value.trim(), 
      slug: newCategory.value.trim().toLowerCase().replace(/ /g, '-'),
      post_count: 0
    })
    newCategory.value = ''
  }
}

function removeCategory(index) {
  const removedCategory = categories.value.splice(index, 1)[0]
  if (removedCategory.id) {
    deletedCategories.value.push(removedCategory.id)
  }
}

async function saveCategories() {
  try {
    await $fetch(props.apiEndpoint, {
      method: 'PUT',
      body: { categories: categories.value, deletedCategories: deletedCategories.value }
    })
    openModal('성공', '카테고리가 성공적으로 저장되었습니다.', () => {
      router.push('/blog') // 또는 적절한 경로로 이동
    })
  } catch (error) {
    console.error('Error saving categories:', error)
    openModal('오류', '카테고리 저장에 실패했습니다.')
  }
}

function cancelEdit() {
  router.back() // 이전 페이지로 돌아가기
}
</script>