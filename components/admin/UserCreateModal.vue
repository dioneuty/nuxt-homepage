<template>
  <div class="modal-wrapper">
    <div class="modal-container">
      <div class="fixed inset-0 transition-opacity" @click="$emit('close')">
        <div class="modal-backdrop"></div>
      </div>

      <div class="modal-content">
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div class="flex-center mb-4">
              <Icon icon="mdi:account-plus" class="w-6 h-6 text-blue-600 mr-2" />
              <h3 class="modal-title">
                새 사용자 추가
              </h3>
            </div>

            <div class="space-y-4">
              <!-- 사용자명 -->
              <div>
                <label class="form-label">
                  사용자명 *
                </label>
                <input
                  v-model="form.username"
                  type="text"
                  required
                  class="form-input"
                  placeholder="사용자명을 입력하세요"
                />
              </div>

              <!-- 이메일 -->
              <div>
                <label class="form-label">
                  이메일 *
                </label>
                <input
                  v-model="form.email"
                  type="email"
                  required
                  class="form-input"
                  placeholder="이메일을 입력하세요"
                />
              </div>

              <!-- 비밀번호 -->
              <div>
                <label class="form-label">
                  비밀번호 *
                </label>
                <input
                  v-model="form.password"
                  type="password"
                  required
                  class="form-input"
                  placeholder="비밀번호를 입력하세요"
                />
              </div>

              <!-- 역할 -->
              <div>
                <label class="form-label">
                  역할
                </label>
                <select
                  v-model="form.role"
                  class="form-select"
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
                <label for="isActive" class="checkbox-label">
                  계정 활성화
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
              type="submit"
              :disabled="loading"
              class="btn btn-primary sm:ml-3"
            >
              <Icon v-if="loading" icon="mdi:loading" class="icon-small mr-2 animate-spin" />
              {{ loading ? '생성 중...' : '생성' }}
            </button>
            <button
              type="button"
              @click="$emit('close')"
              class="mt-3 btn btn-secondary sm:mt-0 sm:ml-3"
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

/**
 * 새 사용자 생성 폼 제출을 처리하는 함수입니다.
 * 로딩 상태를 설정하고, API를 호출하여 사용자를 생성합니다.
 * 성공 시 `created` 이벤트를 발생시키고, 실패 시 에러 메시지를 표시합니다.
 */
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