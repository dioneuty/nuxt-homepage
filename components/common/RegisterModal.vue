<template>
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 class="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          회원가입
        </h2>
        <div class="text-center text-gray-700 dark:text-gray-300">
          <p>회원가입은 추후에 가능해질 예정입니다.</p>
          <p class="mt-2">불편을 드려 죄송합니다.</p>
        </div>
        <!-- <form @submit.prevent="handleRegister" class="space-y-6">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300">사용자 이름</label>
            <input id="username" v-model="username" type="text" required class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">이메일</label>
            <input id="email" v-model="email" type="email" required class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">비밀번호</label>
            <input id="password" v-model="password" type="password" required class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>
          <div>
            <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              회원가입
            </button>
          </div>
        </form> -->
        <button @click="closeModal" class="mt-4 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          닫기
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRegisterModal } from '~/composables/useRegisterModal'
  import { useAuth } from '~/composables/useAuth'
  
  const { isOpen, closeModal } = useRegisterModal()
  const { setAuth } = useAuth()
  
  const username = ref('')
  const email = ref('')
  const password = ref('')
  
  async function handleRegister() {
    try {
      const response = await fetch('/api/user?type=register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.value,
          email: email.value,
          password: password.value,
        }),
      })
  
      if (response.ok) {
        const data = await response.json()
        setAuth(true, data.user)
        closeModal()
        // 추가적인 회원가입 성공 처리 (예: 페이지 리로드, 리다이렉트 등)
      } else {
        const errorData = await response.json()
        console.error('Register error:', errorData)
        alert(`회원가입에 실패했습니다: ${errorData.statusMessage || '알 수 없는 오류'}`)
      }
    } catch (error) {
      console.error('Register error:', error)
      alert('회원가입 중 오류가 발생했습니다.')
    }
  }
  </script>