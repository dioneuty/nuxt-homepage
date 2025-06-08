<template>
  <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20" @click.stop>
    <div class="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
      <a
        v-for="(option, index) in options"
        :key="index"
        @click="selectOption(option)"
        class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer"
        role="menuitem"
      >
        {{ option.label }}
      </a>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';

const props = defineProps({
  options: {
    type: Array,
    required: true,
    default: () => [],
  },
});

const emit = defineEmits(['select', 'close']);

function selectOption(option) {
  emit('select', option);
  emit('close'); // 옵션 선택 후 드롭다운 닫기
}

// 외부 클릭 시 드롭다운 닫기 로직
function handleClickOutside(event) {
  if (!event.target.closest('.outline-item-container .relative')) { // Adjust selector to be more specific
    emit('close');
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* Tailwind CSS classes are used, no additional styles needed */
</style> 