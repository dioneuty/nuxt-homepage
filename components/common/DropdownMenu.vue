<template>
  <div class="dropdown absolute right-0 mt-2 w-48 ring-1 ring-black ring-opacity-5 focus:outline-none z-20" @click.stop>
    <div class="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
      <a
        v-for="(option, index) in options"
        :key="index"
        @click="selectOption(option)"
        class="dropdown-item block text-sm"
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

/**
 * 드롭다운 옵션을 선택했을 때 호출되는 함수입니다.
 * 'select' 이벤트를 발생시켜 선택된 옵션을 전달하고, 드롭다운을 닫기 위해 'close' 이벤트를 발생시킵니다.
 * @param {object} option - 선택된 드롭다운 옵션 객체.
 */
function selectOption(option) {
  emit('select', option);
  emit('close'); // 옵션 선택 후 드롭다운 닫기
}

/**
 * 드롭다운 외부 클릭 시 드롭다운을 닫는 로직을 처리하는 함수입니다.
 * 이벤트 타겟이 드롭다운 외부일 경우 'close' 이벤트를 발생시킵니다.
 * @param {Event} event - 클릭 이벤트 객체.
 */
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