<template>
  <Transition name="toast">
    <div
      :class="[
        'rounded-lg shadow-lg p-4 mb-4 transition-all duration-300 transform',
        type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' :
        type === 'error' ? 'bg-red-100 border border-red-400 text-red-700' :
        type === 'warning' ? 'bg-yellow-100 border border-yellow-400 text-yellow-700' :
        'bg-blue-100 border border-blue-400 text-blue-700'
      ]"
    >
      <div class="flex items-start">
        <Icon
          :icon="getIcon"
          class="w-5 h-5 mr-3 flex-shrink-0 mt-0.5"
        />
        <div class="flex-1">
          <p class="text-sm font-medium">{{ message }}</p>
        </div>
        <button
          @click="$emit('close')"
          class="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition ease-in-out duration-150"
        >
          <Icon icon="mdi:close" class="w-4 h-4" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { computed } from 'vue'

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'success',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  duration: {
    type: Number,
    default: 5000
  }
})

const emit = defineEmits(['close'])

const getIcon = computed(() => {
  switch (props.type) {
    case 'success':
      return 'mdi:check-circle'
    case 'error':
      return 'mdi:alert-circle'
    case 'warning':
      return 'mdi:alert'
    default:
      return 'mdi:information'
  }
})
</script>

<style>
.toast-enter-active, .toast-leave-active {
  transition: all 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateY(-50px);
}
</style> 