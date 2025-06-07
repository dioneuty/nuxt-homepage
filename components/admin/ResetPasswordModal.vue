<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" @click="$emit('close')">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <form @submit.prevent="handleSubmit">
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="flex items-center mb-4">
              <Icon icon="mdi:lock-reset" class="w-6 h-6 text-yellow-600 mr-2" />
              <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                비밀번호 재설정
              </h3>
            </div>

            <div class="mb-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                <strong>{{ user.username }}</strong> ({{ user.email }})의 비밀번호를 재설정합니다.
              </p>
            </div>

            <div class="space-y-4">
              <!-- 새 비밀번호 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  새 비밀번호 *
                </label>
                <input
                  v-model="form.newPassword"
                  type="password"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="새 비밀번호를 입력하세요"
                />
              </div>

              <!-- 비밀번호 확인 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  비밀번호 확인 *
                </label>
                <input
                  v-model="form.confirmPassword"
                  type="password"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="비밀번호를 다시 입력하세요"
                />
              </div>
            </div>

            <!-- 에러 메시지 -->
            <div v-if="error" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {{ error }}
            </div>

            <!-- 경고 메시지 -->
            <div class="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
              <div class="flex">
                <Icon icon="mdi:alert" class="w-5 h-5 mr-2 flex-shrink-0" />
                <div class="text-sm">
                  <p class="font-medium">주의사항</p>
                  <p>비밀번호를 재설정하면 해당 사용자는 즉시 새 비밀번호로 로그인해야 합니다.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              :disabled="loading || !isPasswordValid"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon v-if="loading" icon="mdi:loading" class="w-4 h-4 mr-2 animate-spin" />
              {{ loading ? '재설정 중...' : '비밀번호 재설정' }}
            </button>
            <button
              type="button"
              @click="$emit('close')"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-700"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { ref, reactive, computed } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'reset'])

const loading = ref(false)
const error = ref('')

const form = reactive({
  newPassword: '',
  confirmPassword: ''
})

const isPasswordValid = computed(() => {
  return form.newPassword.length >= 4 && 
         form.newPassword === form.confirmPassword
})

const handleSubmit = async () => {
  if (!isPasswordValid.value) {
    error.value = '비밀번호는 4자 이상이어야 하며, 확인 비밀번호와 일치해야 합니다.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await $fetch(`/api/admin/users/${props.user.id}/reset-password`, {
      method: 'POST',
      body: {
        newPassword: form.newPassword
      }
    })
    emit('reset', response)
  } catch (err) {
    error.value = err.data?.message || '비밀번호 재설정에 실패했습니다.'
  } finally {
    loading.value = false
  }
}
</script> 