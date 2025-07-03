<template>
  <div class="thread-editor bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ isEditing ? 'Edit Thread' : 'New Thread' }}
      </h3>
      <button 
        @click="$emit('close')"
        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <Icon icon="mdi:close" class="text-xl" />
      </button>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="p-4 space-y-4">
      <!-- Title Input -->
      <div>
        <label for="thread-title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Thread Title
        </label>
        <input
          id="thread-title"
          v-model="formData.title"
          type="text"
          placeholder="Enter thread title..."
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
          required
        />
      </div>

      <!-- Content Textarea -->
      <div>
        <label for="thread-content" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Thread Content
        </label>
        <textarea
          id="thread-content"
          v-model="formData.content"
          rows="6"
          placeholder="Write your thoughts about this video..."
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white resize-vertical"
          required
        ></textarea>
      </div>

      <!-- Tags Input -->
      <div>
        <label for="thread-tags" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags (comma-separated)
        </label>
        <input
          id="thread-tags"
          v-model="tagsInput"
          type="text"
          placeholder="analysis, review, thoughts..."
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
        />
        <div v-if="formData.tags.length > 0" class="flex flex-wrap gap-2 mt-2">
          <span
            v-for="tag in formData.tags"
            :key="tag"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
          >
            {{ tag }}
            <button
              type="button"
              @click="removeTag(tag)"
              class="ml-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              <Icon icon="mdi:close" class="text-xs" />
            </button>
          </span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="isSubmitting || !formData.title.trim() || !formData.content.trim()"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <Icon v-if="isSubmitting" icon="mdi:loading" class="animate-spin mr-2" />
          {{ isEditing ? 'Update Thread' : 'Create Thread' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  videoId: {
    type: String,
    required: true
  },
  thread: {
    type: Object,
    default: null
  },
  isVisible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

// Form state
const formData = ref({
  title: '',
  content: '',
  tags: []
})

const tagsInput = ref('')
const isSubmitting = ref(false)

// Computed
const isEditing = computed(() => !!props.thread)

// Watch for thread changes (editing mode)
watch(() => props.thread, (newThread) => {
  if (newThread) {
    formData.value = {
      title: newThread.title || '',
      content: newThread.content || '',
      tags: [...(newThread.tags || [])]
    }
    tagsInput.value = newThread.tags ? newThread.tags.join(', ') : ''
  } else {
    resetForm()
  }
}, { immediate: true })

// Watch tags input for parsing
watch(tagsInput, (newValue) => {
  if (newValue) {
    formData.value.tags = newValue
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
  } else {
    formData.value.tags = []
  }
})

// Methods
const resetForm = () => {
  formData.value = {
    title: '',
    content: '',
    tags: []
  }
  tagsInput.value = ''
  isSubmitting.value = false
}

const removeTag = (tagToRemove) => {
  formData.value.tags = formData.value.tags.filter(tag => tag !== tagToRemove)
  tagsInput.value = formData.value.tags.join(', ')
}

const handleSubmit = async () => {
  if (!formData.value.title.trim() || !formData.value.content.trim()) {
    return
  }

  isSubmitting.value = true

  try {
    const threadData = {
      videoId: props.videoId,
      title: formData.value.title.trim(),
      content: formData.value.content.trim(),
      tags: formData.value.tags
    }

    if (isEditing.value) {
      threadData.id = props.thread.id
    }

    emit('submit', threadData)
    
    if (!isEditing.value) {
      resetForm()
    }
  } catch (error) {
    console.error('Error submitting thread:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Reset form when component becomes visible
watch(() => props.isVisible, (visible) => {
  if (visible && !isEditing.value) {
    resetForm()
  }
})
</script>

<style scoped>
.thread-editor {
  max-width: 600px;
  width: 100%;
}
</style>