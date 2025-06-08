<template>
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 class="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          회원가입
        </h2>
        <!-- <div class="text-center text-gray-700 dark:text-gray-300">
          <p>회원가입은 추후에 가능해질 예정입니다.</p>
          <p class="mt-2">불편을 드려 죄송합니다.</p>
        </div> -->
        <form @submit.prevent="handleRegister" class="space-y-6">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300">사용자 이름</label>
            <div class="mt-1 flex rounded-md shadow-sm">
              <input id="username" v-model="username" type="text" required
                class="flex-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                :class="{'text-red-500': usernameChecked && !isUsernameAvailable, 'text-green-500': usernameChecked && isUsernameAvailable}">
              <button type="button" @click="checkUsernameDuplication"
                class="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md bg-gray-50 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                중복 확인
              </button>
            </div>
            <p v-if="usernameCheckMessage" :class="{'text-red-500': !isUsernameAvailable, 'text-green-500': isUsernameAvailable}" class="mt-2 text-sm">{{ usernameCheckMessage }}</p>
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">이메일</label>
            <input id="email" v-model="email" type="email" required
              class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              :class="{'text-red-500': email.length > 0 && !isEmailValid, 'text-green-500': email.length > 0 && isEmailValid}">
            <p v-if="emailValidationMessage" :class="{'text-red-500': !isEmailValid, 'text-green-500': isEmailValid}" class="mt-2 text-sm">{{ emailValidationMessage }}</p>
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">비밀번호</label>
            <input id="password" v-model="password" type="password" required
              class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              :class="{'text-red-500': password.length > 0 && !isPasswordValid, 'text-green-500': password.length > 0 && isPasswordValid}">
            <p v-if="passwordValidationMessage" :class="{'text-red-500': !isPasswordValid, 'text-green-500': isPasswordValid}" class="mt-2 text-sm">{{ passwordValidationMessage }}</p>
          </div>
          <div>
            <button type="submit" :disabled="!usernameChecked || !isUsernameAvailable || !isEmailValid || !isPasswordValid" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
              회원가입
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
  import { ref, watch } from 'vue'
  import { useRegisterModal } from '~/composables/useRegisterModal'
  import { useAuth } from '~/composables/useAuth'
  import { useToast } from '~/composables/useToast'
  
  const { isOpen, closeModal } = useRegisterModal()
  const { setAuth } = useAuth()
  const { showToast } = useToast()
  
  const username = ref('')
  const email = ref('')
  const password = ref('')
  
  const usernameChecked = ref(false) // 중복 확인 완료 여부
  const isUsernameAvailable = ref(false) // 사용자 이름 사용 가능 여부
  const usernameCheckMessage = ref('') // 중복 확인 메시지
  
  const isEmailValid = ref(false)
  const emailValidationMessage = ref('')
  const isPasswordValid = ref(false)
  const passwordValidationMessage = ref('')
  
  // 모달이 닫힐 때 필드 값 초기화
  watch(isOpen, (newVal) => {
    if (!newVal) {
      username.value = '';
      email.value = '';
      password.value = '';
      usernameChecked.value = false;
      isUsernameAvailable.value = false;
      usernameCheckMessage.value = '';
      isEmailValid.value = false;
      emailValidationMessage.value = '';
      isPasswordValid.value = false;
      passwordValidationMessage.value = '';
    }
  });
  
  // 사용자 이름 변경 시 중복 확인 상태 초기화
  watch(username, () => {
    usernameChecked.value = false
    isUsernameAvailable.value = false
    usernameCheckMessage.value = ''
  })
  
  // 이메일 유효성 검사
  watch(email, (newValue) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (newValue.length === 0) {
      isEmailValid.value = false;
      emailValidationMessage.value = '';
    } else if (emailRegex.test(newValue)) {
      isEmailValid.value = true;
      emailValidationMessage.value = '유효한 이메일 형식입니다.';
    } else {
      isEmailValid.value = false;
      emailValidationMessage.value = '유효하지 않은 이메일 형식입니다.';
    }
  })
  
  // 비밀번호 유효성 검사
  watch(password, (newValue) => {
    // 최소 6자, 하나 이상의 문자, 하나 이상의 숫자
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/
    if (newValue.length === 0) {
      isPasswordValid.value = false;
      passwordValidationMessage.value = '';
    } else if (passwordRegex.test(newValue)) {
      isPasswordValid.value = true;
      passwordValidationMessage.value = '유효한 비밀번호입니다.';
    } else {
      isPasswordValid.value = false;
      passwordValidationMessage.value = '비밀번호는 최소 6자 이상이며, 문자 및 숫자를 포함해야 합니다.';
    }
  })
  
  async function checkUsernameDuplication() {
    if (!username.value) {
      usernameCheckMessage.value = '사용자 이름을 입력해주세요.'
      isUsernameAvailable.value = false
      usernameChecked.value = false
      return
    }
  
    try {
      const response = await fetch(`/api/user/check-username?username=${username.value}`)
      const data = await response.json()
  
      if (response.ok) {
        isUsernameAvailable.value = data.available
        usernameCheckMessage.value = data.message
        usernameChecked.value = true
      } else {
        isUsernameAvailable.value = false
        usernameCheckMessage.value = data.statusMessage || '중복 확인 중 오류 발생'
        usernameChecked.value = true
      }
    } catch (error) {
      console.error('Username duplication check error:', error)
      isUsernameAvailable.value = false
      usernameCheckMessage.value = '중복 확인 중 네트워크 오류가 발생했습니다.'
      usernameChecked.value = true
    }
  }
  
  async function handleRegister() {
    // 최종 유효성 검사
    if (!usernameChecked.value || !isUsernameAvailable.value) {
      showToast('사용자 이름 중복 확인이 필요하거나, 사용 불가능한 사용자 이름입니다.', 'error')
      return
    }
    if (!isEmailValid.value) {
      showToast('유효한 이메일 주소를 입력해주세요.', 'error')
      return
    }
    if (!isPasswordValid.value) {
      showToast('유효한 비밀번호를 입력해주세요.', 'error')
      return
    }
  
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
        showToast('회원가입이 완료되었습니다.', 'success')
        // 추가적인 회원가입 성공 처리 (예: 페이지 리로드, 리다이렉트 등)
      } else {
        const errorData = await response.json()
        console.error('Register error:', errorData)
        showToast(`회원가입에 실패했습니다: ${errorData.statusMessage || '알 수 없는 오류'}`, 'error')
      }
    } catch (error) {
      console.error('Register error:', error)
      showToast('회원가입 중 오류가 발생했습니다.', 'error')
    }
  }
  </script>