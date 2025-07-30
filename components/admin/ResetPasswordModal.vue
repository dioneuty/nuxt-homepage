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
              <Icon icon="mdi:lock-reset" class="w-6 h-6 text-yellow-600 mr-2" />
              <h3 class="modal-title">
                비밀번호 재설정
              </h3>
            </div>

            <div class="mb-4">
              <p class="text-sm text-muted">
                <strong>{{ user.username }}</strong> ({{ user.email }})의 비밀번호를 재설정합니다.
              </p>
            </div>

            <div class="space-y-4">
              <!-- 새 비밀번호 -->
              <div>
                <label class="form-label">
                  새 비밀번호 *
                </label>
                <input
                  v-model="form.newPassword"
                  type="password"
                  required
                  class="form-input"
                  placeholder="새 비밀번호를 입력하세요"
                />
              </div>

              <!-- 비밀번호 확인 -->
              <div>
                <label class="form-label">
                  비밀번호 확인 *
                </label>
                <input
                  v-model="form.confirmPassword"
                  type="password"
                  required
                  class="form-input"
                  placeholder="비밀번호를 다시 입력하세요"
                />
              </div>
            </div>

            <!-- 에러 메시지 -->
            <div v-if="error" class="mt-4 alert alert-danger">
              {{ error }}
            </div>

            <!-- 경고 메시지 -->
            <div class="mt-4 alert alert-warning">
              <div class="flex">
                <Icon icon="mdi:alert" class="alert-icon" />
                <div class="text-sm">
                  <p class="font-medium">주의사항</p>
                  <p>비밀번호를 재설정하면 해당 사용자는 즉시 새 비밀번호로 로그인해야 합니다.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="submit"
              :disabled="loading || !isPasswordValid"
              class="btn btn-warning sm:ml-3"
            >
              <Icon v-if="loading" icon="mdi:loading" class="icon-small mr-2 animate-spin" />
              {{ loading ? '재설정 중...' : '비밀번호 재설정' }}
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

/**
 * 새 비밀번호와 확인 비밀번호의 유효성을 검사하는 computed 속성입니다.
 * 비밀번호가 4자 이상이고, 새 비밀번호와 확인 비밀번호가 일치하면 `true`를 반환합니다.
 * @returns {boolean} 비밀번호 유효성 여부.
 */
const isPasswordValid = computed(() => {
  return form.newPassword.length >= 4 && 
         form.newPassword === form.confirmPassword
})

/**
 * 비밀번호 재설정 폼 제출을 처리하는 함수입니다.
 * 비밀번호 유효성을 검사하고, 유효하지 않으면 에러 메시지를 표시합니다.
 * 유효하다면 API를 호출하여 비밀번호를 재설정하고,
 * 성공 시 `reset` 이벤트를 발생시키고, 실패 시 에러 메시지를 표시합니다.
 */
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