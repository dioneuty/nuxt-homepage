<template>
  <div class="thread-display">
    <!-- Thread List -->
    <div v-if="videoThreads.length > 0" class="space-y-4">
      <div
        v-for="thread in videoThreads"
        :key="thread.id"
        class="thread-item card hover:shadow-md transition-shadow"
      >
        <!-- Thread Header -->
        <div class="flex items-start justify-between card-padded border-b border-gray-100 dark:border-gray-700">
          <div class="flex-1">
            <h4 class="subsection-title mb-1">
              {{ thread.title }}
            </h4>
            <div class="flex items-center text-sm text-muted space-x-4">
              <span class="flex items-center">
                <Icon icon="mdi:account" class="mr-1 icon-small" />
                {{ thread.author }}
              </span>
              <span class="flex items-center">
                <Icon icon="mdi:clock-outline" class="mr-1 icon-small" />
                {{ formatDate(thread.createdAt) }}
              </span>
              <span v-if="thread.updatedAt !== thread.createdAt" class="flex items-center">
                <Icon icon="mdi:pencil" class="mr-1 icon-small" />
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
                class="icon-medium" 
              />
            </button>
            <button
              @click="editThread(thread)"
              class="text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
              title="Edit thread"
            >
              <Icon icon="mdi:pencil" class="icon-small" />
            </button>
            <button
              @click="confirmDeleteThread(thread)"
              class="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
              title="Delete thread"
            >
              <Icon icon="mdi:delete" class="icon-small" />
            </button>
          </div>
        </div>

        <!-- Thread Content -->
        <div v-show="expandedThreads.has(thread.id)" class="card-padded">
          <div class="prose dark:prose-invert max-w-none">
            <p class="whitespace-pre-wrap leading-relaxed">
              {{ thread.content }}
            </p>
          </div>
          
          <!-- Tags -->
          <div v-if="thread.tags && thread.tags.length > 0" class="flex flex-wrap gap-2 mt-4">
            <span
              v-for="tag in thread.tags"
              :key="tag"
              class="badge badge-secondary inline-flex items-center"
            >
              <Icon icon="mdi:tag" class="mr-1 icon-small" />
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8">
      <Icon icon="mdi:comment-text-outline" class="mx-auto text-4xl text-muted mb-4" />
      <p class="text-muted text-lg mb-2">No threads yet</p>
      <p class="text-muted text-sm">
        Be the first to share your thoughts about this video
      </p>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="threadToDelete"
      class="modal-overlay"
      @click="cancelDelete"
    >
      <div
        class="modal-container max-w-md"
        @click.stop
      >
        <div class="modal-body">
          <div class="flex items-center mb-4">
            <Icon icon="mdi:alert-circle" class="text-red-500 text-2xl mr-3" />
            <h3 class="subsection-title">
              Delete Thread
            </h3>
          </div>
          <p class="text-muted mb-6">
            Are you sure you want to delete "{{ threadToDelete.title }}"? This action cannot be undone.
          </p>
          <div class="modal-footer border-t-0">
            <button
              @click="cancelDelete"
              class="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              @click="confirmDelete"
              :disabled="isDeleting"
              class="btn btn-danger flex items-center"
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