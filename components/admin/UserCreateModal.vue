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
              <Icon icon="mdi:account-plus" class="w-6 h-6 text-blue-600 mr-2" />
              <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                새 사용자 추가
              </h3>
            </div>

            <div class="space-y-4">
              <!-- 사용자명 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  사용자명 *
                </label>
                <input
                  v-model="form.username"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="사용자명을 입력하세요"
                />
              </div>

              <!-- 이메일 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  이메일 *
                </label>
                <input
                  v-model="form.email"
                  type="email"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="이메일을 입력하세요"
                />
              </div>

              <!-- 비밀번호 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  비밀번호 *
                </label>
                <input
                  v-model="form.password"
                  type="password"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="비밀번호를 입력하세요"
                />
              </div>

              <!-- 역할 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  역할
                </label>
                <select
                  v-model="form.role"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="USER">일반 사용자</option>
                  <option value="ADMIN">관리자</option>
                </select>
              </div>

              <!-- 계정 상태 -->
              <div class="flex items-center">
                <input
                  v-model="form.isActive"
                  type="checkbox"
                  id="isActive"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label for="isActive" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  계정 활성화
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
              type="submit"
              :disabled="loading"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon v-if="loading" icon="mdi:loading" class="w-4 h-4 mr-2 animate-spin" />
              {{ loading ? '생성 중...' : '생성' }}
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
import { ref, reactive } from 'vue'

const emit = defineEmits(['close', 'created'])

const loading = ref(false)
const error = ref('')

const form = reactive({
  username: '',
  email: '',
  password: '',
  role: 'USER',
  isActive: true
})

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/admin/users', {
      method: 'POST',
      body: form
    })
    emit('created', response.user)
  } catch (err) {
    error.value = err.data?.message || '사용자 생성에 실패했습니다.'
  } finally {
    loading.value = false
  }
}
</script> 