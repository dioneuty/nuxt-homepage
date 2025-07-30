<template>
  <Transition name="toast">
    <div
      :class="[
        'toast-base',
        type === 'success' ? 'toast-success' :
        type === 'error' ? 'toast-error' :
        type === 'warning' ? 'toast-warning' :
        'toast-info'
      ]"
    >
      <div class="toast-content">
        <Icon
          :icon="getIcon"
          class="toast-icon"
        />
        <div class="flex-1">
          <p class="toast-message">{{ message }}</p>
        </div>
        <button
          @click="$emit('close')"
          class="toast-close-btn"
        >
          <Icon icon="mdi:close" class="toast-close-icon" />
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