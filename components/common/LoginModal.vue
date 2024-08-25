<template>
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 class="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          로그인
        </h2>
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300">사용자 이름</label>
            <input id="username" v-model="username" type="text" required class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">비밀번호</label>
            <input id="password" v-model="password" type="password" required class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>
          <div>
            <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              로그인
            </button>
          </div>
        </form>
        <button @click="closeModal" class="mt-4 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          닫기
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useLoginModal } from '~/composables/useLoginModal'
  import { useAuth } from '~/composables/useAuth'

  const { isOpen, closeModal } = useLoginModal()
  const { setAuth } = useAuth()

  const username = ref('')
  const password = ref('')

  async function handleLogin() {
    try {
      const response = await fetch('/api/user?type=login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.value,
          password: password.value,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAuth(true, data.user)
        closeModal()
        // 추가적인 로그인 성공 처리 (예: 페이지 리로드, 리다이렉트 등)
      } else {
        const errorData = await response.json()
        console.error('Login error:', errorData)
        alert(`로그인에 실패했습니다: ${errorData.statusMessage || '알 수 없는 오류'}`)
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('로그인 중 오류가 발생했습니다.')
    }
  }
  </script>