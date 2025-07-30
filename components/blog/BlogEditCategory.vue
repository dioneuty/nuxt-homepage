<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="page-title">{{ title }}</h1>
    <div v-if="pending" class="flex justify-center items-center h-64">
      <Icon icon="eos-icons:loading" class="text-blue-500" width="48" height="48" />
    </div>
    <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
      <p class="font-bold">에러 발생</p>
      <p>{{ error }}</p>
    </div>
    <div v-else class="card-padded shadow-lg mb-6">
      <div class="mb-4 flex">
        <input 
          v-model="newCategory" 
          @keyup.enter="addCategory" 
          :placeholder="newCategoryPlaceholder" 
          class="input flex-grow mr-2"
        >
        <button 
          @click="addCategory" 
          class="btn-primary"
        >
          {{ addButtonText }}
        </button>
      </div>
      <ul class="mb-4">
        <li v-for="(category, index) in categories" :key="index" class="mb-2 flex items-center">
          <input 
            v-model="category.name" 
            class="input flex-grow mr-2"
          >
          <span class="mr-2 text-gray-600 dark:text-gray-400">
            ({{ category.post_count || 0 }})
          </span>
          <button 
            @click="removeCategory(index)" 
            class="btn-danger"
          >
            {{ removeButtonText }}
          </button>
        </li>
      </ul>
    </div>
    <div class="flex justify-between">
      <button 
        @click="cancelEdit" 
        class="btn-secondary"
      >
        {{ cancelButtonText }}
      </button>
      <button 
        @click="saveCategories" 
        class="btn-success"
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

/**
 * 컴포넌트 마운트 시 카테고리 데이터를 비동기적으로 가져옵니다.
 * 로딩 상태를 설정하고, API 호출 중 에러 발생 시 `error` 상태를 업데이트합니다.
 */
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

/**
 * 새 카테고리를 추가하는 함수입니다.
 * 입력된 카테고리 이름이 비어있지 않으면, `categories` 배열에 새 카테고리를 추가하고 입력 필드를 초기화합니다.
 */
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

/**
 * 지정된 인덱스의 카테고리를 제거하는 함수입니다.
 * 제거된 카테고리에 `id`가 있다면 `deletedCategories` 배열에 추가하여 삭제 요청 시 사용될 수 있도록 합니다.
 * @param {number} index - 제거할 카테고리의 인덱스.
 */
function removeCategory(index) {
  const removedCategory = categories.value.splice(index, 1)[0]
  if (removedCategory.id) {
    deletedCategories.value.push(removedCategory.id)
  }
}

/**
 * 변경된 카테고리 목록을 서버에 저장하는 함수입니다.
 * API를 호출하여 카테고리 목록과 삭제된 카테고리 ID를 전송합니다.
 * 성공 시 성공 모달을 띄우고 블로그 페이지로 이동하며, 실패 시 오류 모달을 띄웁니다.
 */
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

/**
 * 카테고리 편집을 취소하고 이전 페이지로 돌아가는 함수입니다.
 */
function cancelEdit() {
  router.back() // 이전 페이지로 돌아가기
}
</script>