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
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import CommonQuillEditor from '~/components/CommonQuillEditor.vue'

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

function addTag() {
  const trimmedTag = newTag.value.trim()
  if (trimmedTag && !tags.value.includes(trimmedTag)) {
    tags.value.push(trimmedTag)
    newTag.value = ''
  }
}

function removeTag(tag) {
  tags.value = tags.value.filter(function(t) { return t !== tag })
}

function clearTags() {
  tags.value = []
}

function handleQuillInput(content) {
  editedItem.value.content = content
}

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