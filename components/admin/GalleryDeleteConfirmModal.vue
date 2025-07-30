<template>
  <div v-if="isOpen" class="modal-wrapper">
    <div class="modal-container">
      <div class="fixed inset-0 transition-opacity" @click="cancel">
        <div class="modal-backdrop"></div>
      </div>

      <div class="modal-content">
        <div class="modal-body">
          <div class="flex-center mb-4">
            <Icon icon="mdi:delete-alert" class="w-6 h-6 text-red-600 mr-2" />
            <h3 class="modal-title">
              {{ title }}
            </h3>
          </div>

          <div class="space-y-4">
            <p class="text-sm text-muted">
              {{ message }}
            </p>

            <!-- 경고 메시지 -->
            <div class="alert alert-danger">
              <div class="flex">
                <Icon icon="mdi:alert" class="alert-icon" />
                <div class="text-sm">
                  <p class="font-medium">주의: 이 작업은 되돌릴 수 없습니다!</p>
                  <ul class="mt-2 list-disc list-inside space-y-1">
                    <li>선택된 항목과 관련된 모든 데이터가 영구적으로 삭제됩니다.</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- 확인 체크박스 -->
            <div class="flex items-center">
              <input
                v-model="confirmDelete"
                type="checkbox"
                id="confirmDeleteGallery"
                class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label for="confirmDeleteGallery" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                위 경고 사항을 이해했으며, 항목을 삭제하겠습니다.
              </label>
            </div>
          </div>

          <!-- 에러 메시지 -->
          <div v-if="error" class="mt-4 alert alert-danger">
            {{ error }}
          </div>
        </div>

        <div class="modal-footer">
          <button
            @click="handleConfirm"
            :disabled="loading || !confirmDelete"
            class="btn btn-danger sm:ml-3"
          >
            <Icon v-if="loading" icon="mdi:loading" class="icon-small mr-2 animate-spin" />
            {{ loading ? '삭제 중...' : '삭제' }}
          </button>
          <button
            type="button"
            @click="cancel"
            class="mt-3 btn btn-secondary sm:mt-0 sm:ml-3"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { ref, watch } from 'vue'

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
    default: '계속하시겠습니까?'
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const loading = ref(false)
const error = ref('')
const confirmDelete = ref(false)

/**
 * `isOpen` prop의 변경을 감지하고 모달이 열릴 때 상태를 초기화합니다.
 * @param {boolean} newVal - `isOpen` prop의 새 값.
 */
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    // 모달이 열릴 때마다 상태 초기화
    loading.value = false;
    error.value = '';
    confirmDelete.value = false;
  }
});

/**
 * 삭제 확인 버튼 클릭을 처리하는 함수입니다.
 * `confirmDelete` 체크박스가 선택되지 않았다면 에러 메시지를 표시합니다.
 * 확인되었다면 로딩 상태를 설정하고 `confirm` 이벤트를 발생시킵니다.
 */
const handleConfirm = () => {
  if (!confirmDelete.value) {
    error.value = '삭제를 확인해주세요.';
    return;
  }
  loading.value = true;
  error.value = ''; // 오류 메시지 초기화
  emit('confirm');
}

/**
 * 취소 버튼 클릭을 처리하는 함수입니다.
 * 부모 컴포넌트에 'cancel' 이벤트를 발생시킵니다.
 */
const cancel = () => {
  emit('cancel');
}
</script> 