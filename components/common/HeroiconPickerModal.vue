<template>
  <Transition name="modal">
    <div v-if="isOpen" class="modal-mask">
      <div class="modal-container dark:bg-gray-800">
        <div class="modal-header">
          <h3 class="text-xl font-semibold dark:text-white">Heroicons 선택</h3>
          <button @click="closeModal" class="modal-close-btn">
            <Icon icon="heroicons-outline:x-mark" class="h-6 w-6" />
          </button>
        </div>
        <div class="modal-body">
          <input
            type="text"
            v-model="searchTerm"
            placeholder="아이콘 검색..."
            class="icon-search-input"
          />
          <div class="icon-grid">
            <div
              v-for="icon in filteredIcons"
              :key="icon.icon"
              @click="selectIcon(icon.icon)"
              class="icon-item icon-picker-item"
            >
              <Icon :icon="icon.icon" class="h-8 w-8 mx-auto mb-1 text-gray-800 dark:text-gray-200" />
              <span class="text-xs text-gray-600 dark:text-gray-400">{{ icon.name }}</span>
            </div>
          </div>
          <div v-if="filteredIcons.length === 0" class="icon-picker-empty">검색 결과가 없습니다.</div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['update:isOpen', 'selectIcon']);

const searchTerm = ref('');
const allIcons = ref([]);

const filteredIcons = computed(() => {
  if (!searchTerm.value) {
    return allIcons.value;
  }
  const lowerCaseSearchTerm = searchTerm.value.toLowerCase();
  return allIcons.value.filter(
    (icon) => icon.name.toLowerCase().includes(lowerCaseSearchTerm)
  );
});

/**
 * Heroicons 데이터를 `heroicons.json` 파일에서 비동기적으로 가져와 `allIcons` 배열에 저장합니다.
 * 데이터를 불러오는 동안 발생할 수 있는 오류를 콘솔에 기록합니다.
 */
const fetchIcons = async () => {
  try {
    const response = await fetch('/data/heroicons.json');
    const data = await response.json();
    allIcons.value = data;
  } catch (error) {
    console.error('Error fetching heroicons:', error);
  }
};

/**
 * 모달을 닫는 함수입니다.
 * `update:isOpen` 이벤트를 발생시켜 모달 상태를 변경하고, 검색어를 초기화합니다.
 */
const closeModal = () => {
  emit('update:isOpen', false);
  searchTerm.value = ''; // 모달 닫을 때 검색어 초기화
};

/**
 * 아이콘을 선택했을 때 호출되는 함수입니다.
 * 선택된 아이콘 이름과 함께 `selectIcon` 이벤트를 발생시키고, 모달을 닫습니다.
 * @param {string} iconName - 선택된 아이콘의 이름.
 */
const selectIcon = (iconName) => {
  emit('selectIcon', iconName);
  closeModal();
};

/**
 * `isOpen` prop의 변경을 감지하여 모달이 열릴 때 아이콘 데이터를 가져옵니다.
 * @param {boolean} newVal - `isOpen` prop의 새 값.
 */
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    fetchIcons();
  }
});
</script>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  transition: opacity 0.3s ease;
  justify-content: center;
  align-items: center;
}

.modal-container {
  width: 90%;
  max-width: 600px;
  margin: auto;
  padding: 20px 30px;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  max-height: 90vh; /* 모달의 최대 높이 설정 */
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-body {
  flex-grow: 1;
  overflow-y: auto; /* 내용이 넘칠 경우 스크롤바 표시 */
  padding-right: 10px; /* 스크롤바 때문에 내용이 가려지지 않도록 패딩 추가 */
}

/* 스크롤바 스타일링 (선택 사항) */
.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-thumb {
  background-color: #cbd5e0; /* gray-300 */
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-track {
  background-color: #edf2f7; /* gray-200 */
}

.dark .modal-body::-webkit-scrollbar-thumb {
  background-color: #4a5568; /* gray-700 */
}

.dark .modal-body::-webkit-scrollbar-track {
  background-color: #2d3748; /* gray-800 */
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); /* 썸네일 크기 조정 */
  gap: 10px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

/* 모달 트랜지션 스타일 */
.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style> 