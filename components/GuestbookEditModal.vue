<template>
  <div v-if="modelValue" class="modal-overlay">
    <div class="modal-container max-w-2xl">
        <div class="flex-between mb-4">
          <h3 class="subsection-title">방명록 수정</h3>
          <button
            @click="$emit('update:modelValue', false)"
            class="text-muted hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Icon name="heroicons:x-mark" class="icon-medium" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="edit-title" class="form-label">제목</label>
            <input
              id="edit-title"
              v-model="form.title"
              type="text"
              required
              class="input mt-1"
            />
          </div>
          <div>
            <label for="edit-content" class="form-label">내용</label>
            <textarea
              id="edit-content"
              v-model="form.content"
              rows="4"
              required
              class="textarea mt-1"
            ></textarea>
          </div>
          <div>
            <label for="edit-password" class="form-label">비밀번호</label>
            <input
              id="edit-password"
              v-model="form.password"
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
              class="btn btn-primary"
            >
              수정하기
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

const form = ref({
  title: props.post.title,
  content: props.post.content,
  password: ''
})

/**
 * 폼 제출을 처리하는 함수입니다.
 * `submit` 이벤트를 발생시켜 폼 데이터를 부모 컴포넌트로 전달하고,
 * 모달을 닫습니다.
 */
const handleSubmit = () => {
  emit('submit', form.value)
  emit('update:modelValue', false)
}
</script> 