<template>
  <div class="modal-wrapper">
    <div class="modal-container">
      <div class="fixed inset-0 transition-opacity" @click="$emit('close')">
        <div class="modal-backdrop"></div>
      </div>

      <div class="modal-content">
        <div class="modal-body">
          <div class="flex-center mb-4">
            <Icon icon="mdi:delete-alert" class="w-6 h-6 text-red-600 mr-2" />
            <h3 class="modal-title">
              사용자 삭제 확인
            </h3>
          </div>

          <div class="space-y-4">
            <p class="text-sm text-muted">
              정말로 <strong class="text-emphasis">{{ user.username }}</strong> ({{ user.email }}) 사용자를 삭제하시겠습니까?
            </p>

            <!-- 경고 메시지 -->
            <div class="alert alert-danger">
              <div class="flex">
                <Icon icon="mdi:alert" class="alert-icon" />
                <div class="text-sm">
                  <p class="font-medium">주의: 이 작업은 되돌릴 수 없습니다!</p>
                  <ul class="mt-2 list-disc list-inside space-y-1">
                    <li>사용자 계정과 관련된 모든 데이터가 영구적으로 삭제됩니다.</li>
                    <li>채팅 기록 등 연관된 데이터도 함께 삭제될 수 있습니다.</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- 확인 체크박스 -->
            <div class="flex items-center">
              <input
                v-model="confirmDelete"
                type="checkbox"
                id="confirmDelete"
                class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label for="confirmDelete" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                위 경고 사항을 이해했으며, 사용자를 삭제하겠습니다.
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
            @click="handleDelete"
            :disabled="loading || !confirmDelete"
            class="btn btn-danger sm:ml-3"
          >
            <Icon v-if="loading" icon="mdi:loading" class="icon-small mr-2 animate-spin" />
            {{ loading ? '삭제 중...' : '삭제' }}
          </button>
          <button
            type="button"
            @click="$emit('close')"
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
import { ref } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'deleted'])

const loading = ref(false)
const error = ref('')
const confirmDelete = ref(false)

/**
 * 사용자 삭제를 처리하는 함수입니다.
 * `confirmDelete` 체크박스가 선택되지 않았다면 에러 메시지를 표시합니다.
 * 삭제 확인 후, API를 호출하여 사용자를 삭제하고,
 * 성공 시 `deleted` 이벤트를 발생시키고, 실패 시 에러 메시지를 표시합니다.
 */
const handleDelete = async () => {
  if (!confirmDelete.value) {
    error.value = '삭제를 확인해주세요.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await $fetch(`/api/admin/users/${props.user.id}`, {
      method: 'DELETE'
    })
    emit('deleted', response)
  } catch (err) {
    error.value = err.data?.message || '사용자 삭제에 실패했습니다.'
  } finally {
    loading.value = false
  }
}
</script> 