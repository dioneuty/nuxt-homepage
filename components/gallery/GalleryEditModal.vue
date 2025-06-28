<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold dark:text-white">
          {{ item.id ? '갤러리 항목 수정' : '새 갤러리 항목 추가' }}
        </h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <Icon icon="mdi:close" class="w-6 h-6" />
        </button>
      </div>
      <form @submit.prevent="saveItem">
        <div class="mb-4">
          <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">제목</label>
          <input type="text" id="title" v-model="editedItem.title" required placeholder="제목을 입력하세요" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">내용</label>
          <CommonQuillEditor
            :value="editedItem.content"
            placeholder="내용을 입력하세요..."
            @input="handleQuillInput"
          />
        </div>
        <div class="mb-4">
          <label for="tags" class="block text-sm font-medium text-gray-700 dark:text-gray-300">태그</label>
          <div class="flex flex-wrap gap-2 mb-2">
            <span v-for="tag in tags" :key="tag" class="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs flex items-center">
              {{ tag }}
              <button @click="removeTag(tag)" class="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <Icon icon="mdi:close" class="w-4 h-4" />
              </button>
            </span>
          </div>
          <div class="flex">
            <input 
              type="text" 
              id="tags" 
              v-model="newTag" 
              @keydown.enter.prevent="addTag"
              placeholder="새 태그 입력 후 Enter" 
              class="flex-grow mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
            <button 
              type="button" 
              @click="clearTags" 
              class="ml-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
            >
              초기화
            </button>
          </div>
        </div>
        <div class="flex justify-end">
          <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            <Icon icon="mdi:content-save" class="mr-2" />
            저장
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import { Icon } from '@iconify/vue'
// 🚀 에디터 지연 로딩
const CommonQuillEditor = defineAsyncComponent(() => import('~/components/CommonQuillEditor.vue'))

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  apiEndpoint: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'save'])

const editedItem = ref({ ...props.item, content: props.item.content || '' })
const tags = ref([...props.item.tags] || [])
const newTag = ref('')

/**
 * 새로운 태그를 추가하는 함수입니다.
 * 입력된 태그가 비어있지 않고 이미 존재하는 태그가 아니면 `tags` 배열에 추가하고 입력 필드를 초기화합니다.
 */
function addTag() {
  const trimmedTag = newTag.value.trim()
  if (trimmedTag && !tags.value.includes(trimmedTag)) {
    tags.value.push(trimmedTag)
    newTag.value = ''
  }
}

/**
 * 특정 태그를 제거하는 함수입니다.
 * @param {string} tag - 제거할 태그 문자열.
 */
function removeTag(tag) {
  tags.value = tags.value.filter(function(t) { return t !== tag })
}

/**
 * 모든 태그를 제거하여 `tags` 배열을 비우는 함수입니다.
 */
function clearTags() {
  tags.value = []
}

/**
 * CommonQuillEditor 컴포넌트에서 `input` 이벤트가 발생했을 때 호출되는 핸들러 함수입니다.
 * 에디터의 콘텐츠를 `editedItem.content`에 업데이트합니다.
 * @param {string} content - Quill 에디터의 HTML 콘텐츠.
 */
function handleQuillInput(content) {
  editedItem.value.content = content
}

/**
 * 갤러리 항목을 저장하는 비동기 함수입니다. (생성 또는 수정)
 * `editedItem`과 `tags`를 포함하여 API 엔드포인트로 요청을 보냅니다.
 * 성공 시 `save` 이벤트를 발생시켜 업데이트된 항목을 부모 컴포넌트로 전달합니다.
 */
async function saveItem() {
  const updatedItem = {
    ...editedItem.value,
    tags: tags.value
  }
  
  const response = await $fetch(props.apiEndpoint, {
    method: updatedItem.id ? 'PUT' : 'POST',
    body: updatedItem
  })
  
  emit('save', response)
}
</script>