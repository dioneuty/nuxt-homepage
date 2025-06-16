<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4">
      <div class="fixed inset-0 bg-black opacity-30" @click="$emit('update:modelValue', false)"></div>
      
      <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">방명록 삭제</h3>
          <button
            @click="$emit('update:modelValue', false)"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>
        </div>

        <p class="text-gray-600 dark:text-gray-300 mb-4">
          정말로 이 방명록을 삭제하시겠습니까?
        </p>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="delete-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">비밀번호</label>
            <input
              id="delete-password"
              v-model="password"
              type="password"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="$emit('update:modelValue', false)"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              취소
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              삭제하기
            </button>
          </div>
        </form>
      </div>
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