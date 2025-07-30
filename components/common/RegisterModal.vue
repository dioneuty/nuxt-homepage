<template>
    <div v-if="isOpen" class="modal-overlay">
      <div class="card-padded shadow-xl max-w-md w-full">
        <h2 class="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          회원가입
        </h2>
        <!-- <div class="text-center text-gray-700 dark:text-gray-300">
          <p>회원가입은 추후에 가능해질 예정입니다.</p>
          <p class="mt-2">불편을 드려 죄송합니다.</p>
        </div> -->
        <form @submit.prevent="handleRegister" class="space-y-6">
          <div>
            <label for="username" class="form-label">사용자 이름</label>
            <div class="mt-1 flex rounded-md shadow-sm">
              <input id="username" v-model="username" type="text" required
                class="input rounded-r-none"
                :class="{'text-red-500': usernameChecked && !isUsernameAvailable, 'text-green-500': usernameChecked && isUsernameAvailable}">
              <button type="button" @click="checkUsernameDuplication"
                class="btn-secondary rounded-l-none">
                중복 확인
              </button>
            </div>
            <p v-if="usernameCheckMessage" :class="{'text-red-500': !isUsernameAvailable, 'text-green-500': isUsernameAvailable}" class="mt-2 text-sm">{{ usernameCheckMessage }}</p>
          </div>
          <div>
            <label for="email" class="form-label">이메일</label>
            <input id="email" v-model="email" type="email" required
              class="input mt-1"
              :class="{'text-red-500': email.length > 0 && !isEmailValid, 'text-green-500': email.length > 0 && isEmailValid}">
            <p v-if="emailValidationMessage" :class="{'text-red-500': !isEmailValid, 'text-green-500': isEmailValid}" class="mt-2 text-sm">{{ emailValidationMessage }}</p>
          </div>
          <div>
            <label for="password" class="form-label">비밀번호</label>
            <input id="password" v-model="password" type="password" required
              class="input mt-1"
              :class="{'text-red-500': password.length > 0 && !isPasswordValid, 'text-green-500': password.length > 0 && isPasswordValid}">
            <p v-if="passwordValidationMessage" :class="{'text-red-500': !isPasswordValid, 'text-green-500': isPasswordValid}" class="mt-2 text-sm">{{ passwordValidationMessage }}</p>
          </div>
          <div>
            <button type="submit" :disabled="!usernameChecked || !isUsernameAvailable || !isEmailValid || !isPasswordValid" class="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
              회원가입
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
  
  /**
   * `isOpen` prop의 변경을 감지하여 모달이 닫힐 때 모든 폼 필드와 관련 상태를 초기화합니다.
   * @param {boolean} newVal - `isOpen` prop의 새 값.
   */
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
  
  /**
   * `username` 값이 변경될 때 사용자 이름 중복 확인 관련 상태를 초기화합니다.
   */
  watch(username, () => {
    usernameChecked.value = false
    isUsernameAvailable.value = false
    usernameCheckMessage.value = ''
  })
  
  /**
   * `email` 값의 유효성을 검사하고, 유효성 검사 메시지를 업데이트합니다.
   * @param {string} newValue - `email`의 새 값.
   */
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
  
  /**
   * `password` 값의 유효성을 검사하고, 유효성 검사 메시지를 업데이트합니다.
   * 비밀번호는 최소 6자 이상이어야 하며, 문자 및 숫자를 포함해야 합니다.
   * @param {string} newValue - `password`의 새 값.
   */
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
  
  /**
   * 사용자 이름 중복 확인을 비동기적으로 수행하는 함수입니다.
   * 사용자 이름이 비어있으면 메시지를 표시하고, 그렇지 않으면 API를 호출하여 중복 여부를 확인합니다.
   * 확인 결과에 따라 `isUsernameAvailable` 및 `usernameCheckMessage`를 업데이트합니다.
   */
  async function checkUsernameDuplication() {
    if (!username.value) {
      setUsernameCheckResult(false, '사용자 이름을 입력해주세요.', false)
      return
    }
  
    try {
      const data = await $fetch(`/api/user/check-username?username=${username.value}`)
      setUsernameCheckResult(data.available, data.message, true)
    } catch (error) {
      console.error('Username duplication check error:', error)
      setUsernameCheckResult(false, '중복 확인 중 오류가 발생했습니다.', true)
    }
  }

  function setUsernameCheckResult(available, message, checked = true) {
    isUsernameAvailable.value = available
    usernameCheckMessage.value = message
    usernameChecked.value = checked
  }
  
  /**
   * 회원가입 폼 제출을 처리하는 비동기 함수입니다.
   * 사용자 이름 중복 확인, 이메일, 비밀번호 유효성을 최종적으로 검사합니다.
   * 모든 유효성 검사를 통과하면 API를 통해 사용자 등록을 시도하고,
   * 성공 시 사용자 인증 상태를 설정하고 모달을 닫으며 성공 토스트 메시지를 표시합니다.
   * 실패 시 오류 토스트 메시지를 표시합니다.
   */
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