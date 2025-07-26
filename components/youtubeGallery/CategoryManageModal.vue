<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center"
    @click="handleBackdropClick"
  >
    <div 
      class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[85vh] flex flex-col"
      @click.stop
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <Icon icon="mdi:tag-multiple" class="mr-2" />
          카테고리 관리
        </h3>
        <button
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <Icon icon="mdi:close" class="w-6 h-6" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-6 overflow-y-auto flex-1 min-h-0">
        <!-- Add New Category Section -->
        <div class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 class="text-lg font-medium text-blue-900 dark:text-blue-200 mb-3">새 카테고리 추가</h4>
          <div class="flex gap-3">
            <input
              v-model="newCategoryName"
              @keydown.enter="addCategory"
              :disabled="addingCategory"
              type="text"
              placeholder="카테고리 이름을 입력하세요"
              class="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
            <button
              @click="addCategory"
              :disabled="!newCategoryName.trim() || addingCategory"
              class="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors flex items-center"
            >
              <Icon v-if="addingCategory" icon="mdi:loading" class="mr-2 animate-spin" />
              <Icon v-else icon="mdi:plus" class="mr-2" />
              {{ addingCategory ? '추가 중...' : '추가' }}
            </button>
          </div>
        </div>

        <!-- Categories List -->
        <div class="space-y-3">
          <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">기존 카테고리</h4>
          
          <!-- Loading State -->
          <div v-if="loading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>

          <!-- Categories List -->
          <div v-else-if="editableCategories.length > 0" class="space-y-2">
            <div
              v-for="category in editableCategories"
              :key="category.id"
              class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <!-- Category Info -->
              <div class="flex-1">
                <div v-if="editingCategoryId === category.id" class="flex items-center gap-3">
                  <input
                    v-model="editCategoryName"
                    @keydown.enter="saveCategory"
                    @keydown.esc="cancelEdit"
                    :ref="`editInput-${category.id}`"
                    type="text"
                    class="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                  <div class="flex gap-2">
                    <button
                      @click="saveCategory"
                      :disabled="!editCategoryName.trim() || savingCategory"
                      class="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-sm transition-colors"
                    >
                      <Icon v-if="savingCategory" icon="mdi:loading" class="animate-spin" />
                      <Icon v-else icon="mdi:check" />
                    </button>
                    <button
                      @click="cancelEdit"
                      :disabled="savingCategory"
                      class="px-3 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded text-sm transition-colors"
                    >
                      <Icon icon="mdi:close" />
                    </button>
                  </div>
                </div>
                <div v-else class="flex items-center">
                  <div class="flex-1">
                    <h5 class="font-medium text-gray-900 dark:text-white">{{ category.name }}</h5>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ category.video_count || 0 }}개 비디오
                      <span v-if="category.slug" class="ml-2 text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                        {{ category.slug }}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div v-if="editingCategoryId !== category.id" class="flex gap-2">
                <button
                  @click="startEdit(category)"
                  :disabled="deletingCategoryId === category.id"
                  class="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 transition-colors"
                  title="수정"
                >
                  <Icon icon="mdi:pencil" class="w-5 h-5" />
                </button>
                <button
                  @click="deleteCategory(category)"
                  :disabled="category.slug === 'uncategorized' || deletingCategoryId === category.id"
                  class="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 transition-colors"
                  :title="category.slug === 'uncategorized' ? '기본 카테고리는 삭제할 수 없습니다' : '삭제'"
                >
                  <Icon 
                    :icon="deletingCategoryId === category.id ? 'mdi:loading' : 'mdi:delete'" 
                    :class="['w-5 h-5', { 'animate-spin': deletingCategoryId === category.id }]"
                  />
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
            생성된 카테고리가 없습니다.
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useToast } from '@/composables/useToast'
import { useYoutubeCategoryStore } from '@/stores/youtubeCategoryStore'
import { storeToRefs } from 'pinia'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'updated'])

const { showToast } = useToast()

// Category store integration
const youtubeCategoryStore = useYoutubeCategoryStore()
const {
  categories,
  loading,
  error
} = storeToRefs(youtubeCategoryStore)

const {
  fetchCategories,
  recalculateVideoCounts
} = youtubeCategoryStore

// Component state
const newCategoryName = ref('')
const addingCategory = ref(false)
const editingCategoryId = ref(null)
const editCategoryName = ref('')
const savingCategory = ref(false)
const deletingCategoryId = ref(null)
const editInput = ref(null)

// Computed
const editableCategories = computed(() => {
  if (!categories.value || !Array.isArray(categories.value)) return []
  // 'all' 카테고리와 'uncategorized' 카테고리는 제외하고 표시
  return categories.value.filter(category => 
    category.id !== 'all' && category.slug !== 'uncategorized'
  )
})

// Methods
const closeModal = () => {
  emit('close')
  // Reset states
  newCategoryName.value = ''
  editingCategoryId.value = null
  editCategoryName.value = ''
}

const handleBackdropClick = () => {
  closeModal()
}

const addCategory = async () => {
  if (!newCategoryName.value.trim() || addingCategory.value) return

  console.log('addCategory 시작:', newCategoryName.value.trim())

  try {
    addingCategory.value = true

    console.log('API 호출 전 - POST /api/admin/youtube-categories')
    const response = await $fetch('/api/admin/youtube-categories', {
      method: 'POST',
      body: {
        name: newCategoryName.value.trim()
      }
    })

    console.log('API 응답:', response)
    showToast('카테고리가 성공적으로 추가되었습니다.', 'success')
    newCategoryName.value = ''
    
    // Refresh categories
    console.log('카테고리 목록 새로고침 시작')
    await fetchCategories()
    emit('updated')
    console.log('카테고리 추가 완료')

  } catch (err) {
    console.error('카테고리 추가 실패:', err)
    console.error('에러 상세:', {
      message: err.message,
      status: err.status,
      statusCode: err.statusCode,
      data: err.data
    })
    showToast(`카테고리 추가에 실패했습니다: ${err.message || err.statusText || '알 수 없는 오류'}`, 'error')
  } finally {
    addingCategory.value = false
  }
}

const startEdit = async (category) => {
  editingCategoryId.value = category.id
  editCategoryName.value = category.name
  
  // Focus input in next tick
  await nextTick()
  // 편집 모드가 활성화된 후 input 요소 찾기
  const inputElement = document.querySelector('.flex-1 input[type="text"]')
  if (inputElement) {
    inputElement.focus()
    inputElement.select()
  }
}

const cancelEdit = () => {
  editingCategoryId.value = null
  editCategoryName.value = ''
}

const saveCategory = async () => {
  if (!editCategoryName.value.trim() || savingCategory.value) return

  console.log('saveCategory 시작:', editingCategoryId.value, editCategoryName.value.trim())

  try {
    savingCategory.value = true

    console.log('API 호출 전 - PUT /api/admin/youtube-categories/' + editingCategoryId.value)
    await $fetch(`/api/admin/youtube-categories/${editingCategoryId.value}`, {
      method: 'PUT',
      body: {
        name: editCategoryName.value.trim()
      }
    })

    console.log('카테고리 수정 API 응답 성공')
    showToast('카테고리가 성공적으로 수정되었습니다.', 'success')
    
    // Reset edit state
    editingCategoryId.value = null
    editCategoryName.value = ''
    
    // Refresh categories
    console.log('카테고리 목록 새로고침 시작')
    await fetchCategories()
    emit('updated')
    console.log('카테고리 수정 완료')

  } catch (err) {
    console.error('카테고리 수정 실패:', err)
    console.error('수정 에러 상세:', {
      message: err.message,
      status: err.status,
      statusCode: err.statusCode,
      data: err.data
    })
    showToast(`카테고리 수정에 실패했습니다: ${err.message || err.statusText || '알 수 없는 오류'}`, 'error')
  } finally {
    savingCategory.value = false
  }
}

const deleteCategory = async (category) => {
  if (category.slug === 'uncategorized' || deletingCategoryId.value === category.id) return

  console.log('deleteCategory 시작:', category)

  // 비디오가 있는 카테고리는 확인 메시지 표시
  const hasVideos = category.video_count > 0
  const confirmMessage = hasVideos 
    ? `"${category.name}" 카테고리에는 ${category.video_count}개의 비디오가 있습니다.\n카테고리를 삭제하면 해당 비디오들은 '미분류'로 이동됩니다.\n\n정말 삭제하시겠습니까?`
    : `"${category.name}" 카테고리를 삭제하시겠습니까?`

  if (!confirm(confirmMessage)) {
    console.log('사용자가 삭제를 취소함')
    return
  }

  try {
    deletingCategoryId.value = category.id

    console.log('API 호출 전 - DELETE /api/admin/youtube-categories/' + category.id)
    await $fetch(`/api/admin/youtube-categories/${category.id}`, {
      method: 'DELETE'
    })

    console.log('카테고리 삭제 API 응답 성공')
    showToast('카테고리가 성공적으로 삭제되었습니다.', 'success')
    
    // Refresh categories and recalculate video counts
    console.log('카테고리 목록 및 비디오 수 새로고침 시작')
    await Promise.all([
      fetchCategories(),
      recalculateVideoCounts()
    ])
    emit('updated')
    console.log('카테고리 삭제 완료')

  } catch (err) {
    console.error('카테고리 삭제 실패:', err)
    console.error('삭제 에러 상세:', {
      message: err.message,
      status: err.status,
      statusCode: err.statusCode,
      data: err.data
    })
    showToast(`카테고리 삭제에 실패했습니다: ${err.message || err.statusText || '알 수 없는 오류'}`, 'error')
  } finally {
    deletingCategoryId.value = null
  }
}

// Watch for modal open to refresh data
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    fetchCategories()
  }
})
</script>