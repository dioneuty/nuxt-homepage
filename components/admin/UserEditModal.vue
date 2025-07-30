<template>
  <div class="modal-overlay">
    <div class="modal-container">
      <div class="fixed inset-0 transition-opacity" @click="$emit('close')">
        <div class="modal-backdrop"></div>
      </div>

      <div class="modal-container sm:max-w-lg">
        <form @submit.prevent="handleSubmit">
          <div class="card-padded">
            <div class="flex-center mb-4">
              <Icon icon="mdi:account-edit" class="w-6 h-6 text-blue-600 mr-2" />
              <h3 class="section-title">
                사용자 정보 수정
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
                  class="input"
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
                  class="input"
                  placeholder="이메일을 입력하세요"
                />
              </div>

              <!-- 새 비밀번호 -->
              <div>
                <label class="form-label">
                  새 비밀번호 (선택사항)
                </label>
                <input
                  v-model="form.password"
                  type="password"
                  class="input"
                  placeholder="새 비밀번호 (변경하지 않으려면 비워두세요)"
                />
                <p class="text-xs text-muted mt-1">
                  비밀번호를 변경하지 않으려면 이 필드를 비워두세요.
                </p>
              </div>

              <!-- 역할 -->
              <div>
                <label class="form-label">
                  역할
                </label>
                <select
                  v-model="form.role"
                  class="input"
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
                  id="isActiveEdit"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label for="isActiveEdit" class="checkbox-label">
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
              class="btn-primary w-full sm:ml-3 sm:w-auto inline-flex justify-center"
            >
              <Icon v-if="loading" icon="mdi:loading" class="icon-small mr-2 animate-spin" />
              {{ loading ? '수정 중...' : '수정' }}
            </button>
            <button
              type="button"
              @click="$emit('close')"
              class="btn-secondary mt-3 w-full sm:mt-0 sm:ml-3 sm:w-auto inline-flex justify-center"
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
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'updated'])

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
 * `props.user`의 변경을 감지하여 폼 데이터를 업데이트합니다.
 * 사용자가 변경될 때마다 폼 필드를 해당 사용자 정보로 채웁니다.
 * @param {object} newUser - 새로 업데이트된 사용자 객체.
 */
watch(() => props.user, (newUser) => {
  if (newUser) {
    form.username = newUser.username
    form.email = newUser.email
    form.password = ''
    form.role = newUser.role
    form.isActive = newUser.isActive
  }
}, { immediate: true })

/**
 * 사용자 정보 수정 폼 제출을 처리하는 함수입니다.
 * 로딩 상태를 설정하고, API를 호출하여 사용자 정보를 업데이트합니다.
 * 성공 시 `updated` 이벤트를 발생시키고, 실패 시 에러 메시지를 표시합니다.
 */
const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch(`/api/admin/users/${props.user.id}`, {
      method: 'PUT',
      body: form
    })
    emit('updated', response.user)
  } catch (err) {
    error.value = err.data?.message || '사용자 정보 수정에 실패했습니다.'
  } finally {
    loading.value = false
  }
}
</script> 