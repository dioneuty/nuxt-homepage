<template>
  <div v-if="modelValue" class="modal-overlay">
    <div class="modal-container max-w-md">
        <div class="flex-between mb-4">
          <h3 class="subsection-title">방명록 삭제</h3>
          <button
            @click="$emit('update:modelValue', false)"
            class="text-muted hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Icon name="heroicons:x-mark" class="icon-medium" />
          </button>
        </div>

        <p class="text-muted mb-4">
          정말로 이 방명록을 삭제하시겠습니까?
        </p>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="delete-password" class="form-label">비밀번호</label>
            <input
              id="delete-password"
              v-model="password"
              type="password"
              required
              class="input mt-1"
            />
          </div>
          <div class="modal-footer">
            <button
              type="button"
              @click="$emit('update:modelValue', false)"
              class="btn btn-secondary"
            >
              취소
            </button>
            <button
              type="submit"
              class="btn btn-danger"
            >
              삭제하기
            </button>
          </div>
        </form>
      </div>
    </div>
</template>

<script setup>
const props = defineProps({
  modelValue: Boolean,
  post: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const password = ref('')

/**
 * 폼 제출을 처리하는 함수입니다.
 * `submit` 이벤트를 발생시켜 입력된 비밀번호를 부모 컴포넌트로 전달하고,
 * 모달을 닫습니다.
 */
const handleSubmit = () => {
  emit('submit', password.value)
  emit('update:modelValue', false)
}
</script> 