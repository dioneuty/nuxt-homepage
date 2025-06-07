<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" @click="$emit('close')">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="flex items-center mb-4">
            <Icon icon="mdi:delete-alert" class="w-6 h-6 text-red-600 mr-2" />
            <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
              사용자 삭제 확인
            </h3>
          </div>

          <div class="space-y-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              정말로 <strong class="text-gray-900 dark:text-gray-100">{{ user.username }}</strong> ({{ user.email }}) 사용자를 삭제하시겠습니까?
            </p>

            <!-- 경고 메시지 -->
            <div class="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              <div class="flex">
                <Icon icon="mdi:alert" class="w-5 h-5 mr-2 flex-shrink-0" />
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
          <div v-if="error" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {{ error }}
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            @click="handleDelete"
            :disabled="loading || !confirmDelete"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon v-if="loading" icon="mdi:loading" class="w-4 h-4 mr-2 animate-spin" />
            {{ loading ? '삭제 중...' : '삭제' }}
          </button>
          <button
            type="button"
            @click="$emit('close')"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-700"
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