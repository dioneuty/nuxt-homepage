<template>
  <div v-if="isVisible" class="modal-wrapper bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div class="modal-content max-w-lg max-h-[90vh] flex flex-col">
      <!-- Modal Header -->
      <div class="flex-between p-4 border-b dark:border-gray-700">
        <h2 class="modal-title text-xl">{{ title }}</h2>
        <div class="flex items-center">
          <button @click="toggleEditMode" class="btn btn-primary-solid p-2 mr-2 transition-transform transform active:scale-98">
            <Icon :icon="isEditing ? 'mdi:eye' : 'mdi:pencil'" class="text-lg" />
          </button>
          <button @click="closeModal" class="btn btn-danger-solid p-2 transition-transform transform active:scale-98">
            <Icon icon="mdi:close" class="text-lg" />
          </button>
        </div>
      </div>

      <!-- Modal Body (Content) -->
      <div class="modal-body overflow-y-auto flex-grow">
        <CommonQuillEditor
          v-if="isEditing"
          :value="content"
          @input="updateContent"
          placeholder="내용을 입력하세요..."
        />
        <OutlineDetailViewer
          v-else
          :content="content"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'
import { Icon } from '@iconify/vue';
// 🚀 에디터 지연 로딩
const CommonQuillEditor = defineAsyncComponent(() => import('~/components/CommonQuillEditor.vue'))
import OutlineDetailViewer from '~/components/OutlineDetailViewer.vue';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  content: {
    type: String,
    default: '',
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'update:content', 'toggle:editMode']);

/**
 * 모달을 닫는 함수입니다.
 * 'close' 이벤트를 발생시켜 부모 컴포넌트에 모달 닫힘을 알립니다.
 */
function closeModal() {
  emit('close');
}

/**
 * 에디터 콘텐츠 업데이트 시 호출되는 함수입니다.
 * 'update:content' 이벤트를 발생시켜 새로운 콘텐츠를 부모 컴포넌트로 전달합니다.
 * @param {string} newContent - 업데이트된 에디터 콘텐츠.
 */
function updateContent(newContent) {
  emit('update:content', newContent);
}

/**
 * 편집 모드를 토글하는 함수입니다.
 * 'toggle:editMode' 이벤트를 발생시켜 부모 컴포넌트에 편집 모드 변경을 알립니다.
 */
function toggleEditMode() {
  emit('toggle:editMode');
}

/**
 * 확인 버튼 클릭 시 호출되는 함수입니다.
 * 'confirm' 이벤트를 발생시켜 부모 컴포넌트에 확인 동작을 알립니다.
 */
const handleConfirm = () => {
  emit('confirm');
  closeModal();
};

/**
 * 취소 버튼 클릭 시 호출되는 함수입니다.
 * 'cancel' 이벤트를 발생시켜 부모 컴포넌트에 취소 동작을 알립니다.
 */
const handleCancel = () => {
  emit('cancel');
  closeModal();
};
</script>

<style scoped>
/* Add any specific modal styles here if needed, otherwise Tailwind handles most. */
</style> 