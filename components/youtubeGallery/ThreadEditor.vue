<template>
  <div class="thread-editor card">
    <!-- Header -->
    <div class="modal-header border-b border-gray-200 dark:border-gray-700">
      <h3 class="subsection-title">
        {{ isEditing ? 'Edit Thread' : 'New Thread' }}
      </h3>
      <button 
        @click="$emit('close')"
        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <Icon icon="mdi:close" class="icon-medium" />
      </button>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="card-padded space-y-4">
      <!-- Title Input -->
      <div>
        <label for="thread-title" class="form-label">
          Thread Title
        </label>
        <input
          id="thread-title"
          v-model="formData.title"
          type="text"
          placeholder="Enter thread title..."
          class="input w-full"
          required
        />
      </div>

      <!-- Content Textarea -->
      <div>
        <label for="thread-content" class="form-label">
          Thread Content
        </label>
        <textarea
          id="thread-content"
          v-model="formData.content"
          rows="6"
          placeholder="Write your thoughts about this video..."
          class="textarea w-full resize-vertical"
          required
        ></textarea>
      </div>

      <!-- Tags Input -->
      <div>
        <label for="thread-tags" class="form-label">
          Tags (comma-separated)
        </label>
        <input
          id="thread-tags"
          v-model="tagsInput"
          type="text"
          placeholder="analysis, review, thoughts..."
          class="input w-full"
        />
        <div v-if="formData.tags.length > 0" class="flex flex-wrap gap-2 mt-2">
          <span
            v-for="tag in formData.tags"
            :key="tag"
            class="badge badge-danger inline-flex items-center"
          >
            {{ tag }}
            <button
              type="button"
              @click="removeTag(tag)"
              class="ml-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              <Icon icon="mdi:close" class="icon-small" />
            </button>
          </span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="modal-footer border-t-0 pt-4">
        <button
          type="button"
          @click="$emit('close')"
          class="btn btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="isSubmitting || !formData.title.trim() || !formData.content.trim()"
          class="btn btn-danger flex items-center"
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