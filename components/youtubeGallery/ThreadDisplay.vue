<template>
  <div class="thread-display">
    <!-- Thread List -->
    <div v-if="videoThreads.length > 0" class="space-y-4">
      <div
        v-for="thread in videoThreads"
        :key="thread.id"
        class="thread-item bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
      >
        <!-- Thread Header -->
        <div class="flex items-start justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <div class="flex-1">
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {{ thread.title }}
            </h4>
            <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
              <span class="flex items-center">
                <Icon icon="mdi:account" class="mr-1" />
                {{ thread.author }}
              </span>
              <span class="flex items-center">
                <Icon icon="mdi:clock-outline" class="mr-1" />
                {{ formatDate(thread.createdAt) }}
              </span>
              <span v-if="thread.updatedAt !== thread.createdAt" class="flex items-center">
                <Icon icon="mdi:pencil" class="mr-1" />
                edited {{ formatDate(thread.updatedAt) }}
              </span>
            </div>
          </div>
          
          <!-- Thread Actions -->
          <div class="flex items-center space-x-2 ml-4">
            <button
              @click="toggleExpanded(thread.id)"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              :title="expandedThreads.has(thread.id) ? 'Collapse' : 'Expand'"
            >
              <Icon 
                :icon="expandedThreads.has(thread.id) ? 'mdi:chevron-up' : 'mdi:chevron-down'" 
                class="text-xl" 
              />
            </button>
            <button
              @click="editThread(thread)"
              class="text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
              title="Edit thread"
            >
              <Icon icon="mdi:pencil" class="text-lg" />
            </button>
            <button
              @click="confirmDeleteThread(thread)"
              class="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
              title="Delete thread"
            >
              <Icon icon="mdi:delete" class="text-lg" />
            </button>
          </div>
        </div>

        <!-- Thread Content -->
        <div v-show="expandedThreads.has(thread.id)" class="p-4">
          <div class="prose dark:prose-invert max-w-none">
            <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {{ thread.content }}
            </p>
          </div>
          
          <!-- Tags -->
          <div v-if="thread.tags && thread.tags.length > 0" class="flex flex-wrap gap-2 mt-4">
            <span
              v-for="tag in thread.tags"
              :key="tag"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            >
              <Icon icon="mdi:tag" class="mr-1 text-xs" />
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8">
      <Icon icon="mdi:comment-text-outline" class="mx-auto text-4xl text-gray-400 dark:text-gray-600 mb-4" />
      <p class="text-gray-500 dark:text-gray-400 text-lg mb-2">No threads yet</p>
      <p class="text-gray-400 dark:text-gray-500 text-sm">
        Be the first to share your thoughts about this video
      </p>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="threadToDelete"
      class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center"
      @click="cancelDelete"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4"
        @click.stop
      >
        <div class="p-6">
          <div class="flex items-center mb-4">
            <Icon icon="mdi:alert-circle" class="text-red-500 text-2xl mr-3" />
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Delete Thread
            </h3>
          </div>
          <p class="text-gray-600 dark:text-gray-300 mb-6">
            Are you sure you want to delete "{{ threadToDelete.title }}"? This action cannot be undone.
          </p>
          <div class="flex justify-end space-x-3">
            <button
              @click="cancelDelete"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              @click="confirmDelete"
              :disabled="isDeleting"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Icon v-if="isDeleting" icon="mdi:loading" class="animate-spin mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  videoId: {
    type: String,
    required: true
  },
  threads: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['edit-thread', 'delete-thread'])

// State
const expandedThreads = ref(new Set())
const threadToDelete = ref(null)
const isDeleting = ref(false)

// Computed
const videoThreads = computed(() => {
  return props.threads.filter(thread => thread.videoId === props.videoId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

// Methods
const toggleExpanded = (threadId) => {
  if (expandedThreads.value.has(threadId)) {
    expandedThreads.value.delete(threadId)
  } else {
    expandedThreads.value.add(threadId)
  }
}

const editThread = (thread) => {
  emit('edit-thread', thread)
}

const confirmDeleteThread = (thread) => {
  threadToDelete.value = thread
}

const cancelDelete = () => {
  threadToDelete.value = null
  isDeleting.value = false
}

const confirmDelete = async () => {
  if (!threadToDelete.value) return

  isDeleting.value = true
  try {
    emit('delete-thread', threadToDelete.value.id)
    threadToDelete.value = null
  } catch (error) {
    console.error('Error deleting thread:', error)
  } finally {
    isDeleting.value = false
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now - date) / (1000 * 60 * 60)
  
  if (diffInHours < 1) {
    return 'just now'
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`
  } else if (diffInHours < 24 * 7) {
    return `${Math.floor(diffInHours / 24)}d ago`
  } else {
    return date.toLocaleDateString()
  }
}

// Auto-expand first thread if there's only one
if (videoThreads.value.length === 1) {
  expandedThreads.value.add(videoThreads.value[0].id)
}
</script>

<style scoped>
.thread-item {
  transition: all 0.2s ease-in-out;
}

.thread-item:hover {
  transform: translateY(-1px);
}

.prose {
  max-width: none;
}

.prose p {
  margin-bottom: 1rem;
}

.prose p:last-child {
  margin-bottom: 0;
}
</style>