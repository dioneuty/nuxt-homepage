<template>
    <div v-if="isOpen" class="modal-overlay">
      <div class="card-padded shadow-xl max-w-md w-full">
        <h2 class="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          로그인
        </h2>
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="username" class="form-label">사용자 이름</label>
            <input id="username" v-model="username" type="text" required class="input mt-1">
          </div>
          <div>
            <label for="password" class="form-label">비밀번호</label>
            <input id="password" v-model="password" type="password" required class="input mt-1">
          </div>
          <div>
            <button type="submit" class="btn-primary w-full justify-center">
              로그인
            </button>
          </div>
        </form>
        <button @click="closeModal" class="btn-secondary mt-4 w-full justify-center">
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

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/user?type=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.value,
          password: password.value,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAuth(true, data.user)
        closeModal()
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