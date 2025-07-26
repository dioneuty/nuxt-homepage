<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center"
    @click="handleBackdropClick"
  >
    <div 
      class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4"
      @click.stop
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ title }}
        </h3>
        <button
          @click="handleCancel"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <Icon icon="mdi:close" class="w-6 h-6" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-6">
        <div 
          v-if="type === 'warning'" 
          class="flex items-start mb-4"
        >
          <Icon 
            icon="mdi:alert-circle" 
            class="w-6 h-6 text-orange-500 mr-3 flex-shrink-0 mt-0.5" 
          />
          <div class="text-sm text-gray-700 dark:text-gray-300">
            <div v-html="formattedMessage"></div>
          </div>
        </div>
        <div 
          v-else-if="type === 'danger'" 
          class="flex items-start mb-4"
        >
          <Icon 
            icon="mdi:delete-alert" 
            class="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" 
          />
          <div class="text-sm text-gray-700 dark:text-gray-300">
            <div v-html="formattedMessage"></div>
          </div>
        </div>
        <div 
          v-else 
          class="flex items-start mb-4"
        >
          <Icon 
            icon="mdi:help-circle" 
            class="w-6 h-6 text-blue-500 mr-3 flex-shrink-0 mt-0.5" 
          />
          <div class="text-sm text-gray-700 dark:text-gray-300">
            <div v-html="formattedMessage"></div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
        <button
          @click="handleCancel"
          class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          {{ cancelText }}
        </button>
        <button
          @click="handleConfirm"
          :class="[
            'px-4 py-2 text-sm font-medium text-white rounded-md transition-colors',
            type === 'danger' 
              ? 'bg-red-600 hover:bg-red-700' 
              : type === 'warning'
              ? 'bg-orange-600 hover:bg-orange-700'
              : 'bg-blue-600 hover:bg-blue-700'
          ]"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '확인'
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info', // 'info', 'warning', 'danger'
    validator: (value) => ['info', 'warning', 'danger'].includes(value)
  },
  confirmText: {
    type: String,
    default: '확인'
  },
  cancelText: {
    type: String,
    default: '취소'
  },
  allowBackdropClose: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

// Convert line breaks to <br> tags for proper display
const formattedMessage = computed(() => {
  return props.message.replace(/\n/g, '<br>')
})

const handleConfirm = () => {
  emit('confirm')
  emit('close')
}

const handleCancel = () => {
  emit('cancel')
  emit('close')
}

const handleBackdropClick = () => {
  if (props.allowBackdropClose) {
    handleCancel()
  }
}
</script>