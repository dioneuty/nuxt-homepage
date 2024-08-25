<template>
  <div class="personal-info-page container mx-auto px-4 py-8 max-w-2xl">
    <h1 class="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">개인정보</h1>
    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <div v-if="!isEditing" class="space-y-4">
        <div class="flex items-center justify-center mb-6">
          <Icon icon="mdi:account-circle" class="h-24 w-24 text-blue-500 dark:text-blue-400" />
        </div>
        <p class="text-lg"><strong class="font-semibold text-gray-700 dark:text-gray-300">이름:</strong> <span class="text-gray-600 dark:text-gray-400">{{ personalInfo.username }}</span></p>
        <p class="text-lg"><strong class="font-semibold text-gray-700 dark:text-gray-300">이메일:</strong> <span class="text-gray-600 dark:text-gray-400">{{ personalInfo.email }}</span></p>
        <button @click="startEditing" class="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 ease-in-out mt-4">
          편집
        </button>
      </div>
      <form v-else @submit.prevent="saveChanges" class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이름:</label>
          <input v-model="editedInfo.username" id="username" type="text" required 
                 class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이메일:</label>
          <input v-model="editedInfo.email" id="email" type="email" required 
                 class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">새 비밀번호:</label>
          <input v-model="editedInfo.password" id="password" type="password" 
                 class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">비밀번호 확인:</label>
          <input v-model="editedInfo.confirmPassword" id="confirmPassword" type="password" 
                 class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>
        <div class="flex space-x-4">
          <button type="submit" class="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-300 ease-in-out">
            저장
          </button>
          <button @click="cancelEditing" type="button" class="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-300 ease-in-out">
            취소
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { Icon } from '@iconify/vue'

const { auth } = useAuth()

const personalInfo = ref({})
const editedInfo = ref({})
const isEditing = ref(false)

const { data: userData, refresh } = await useFetch('/api/user?type=check', {
  server: false,
  lazy: true
})

watch(userData, function() {
  if (userData.value && userData.value.isLoggedIn && userData.value.user) {
    personalInfo.value = userData.value.user
    editedInfo.value = { ...userData.value.user, password: '', confirmPassword: '' }
  } else {
    // 로그인되지 않은 경우 처리
    navigateTo('/login')
  }
})

onMounted(function() {
  refresh()
})

function startEditing() {
  isEditing.value = true
}

function cancelEditing() {
  editedInfo.value = { ...personalInfo.value, password: '', confirmPassword: '' }
  isEditing.value = false
}

async function saveChanges(event) {
  event.preventDefault()
  if (editedInfo.value.password !== editedInfo.value.confirmPassword) {
    alert('비밀번호가 일치하지 않습니다.')
    return
  }

  try {
    const { data, error } = await useFetch('/api/user?type=update', {
      method: 'POST',
      body: {
        username: editedInfo.value.username,
        email: editedInfo.value.email,
        password: editedInfo.value.password || undefined
      }
    })

    if (error.value) {
      throw error.value
    }

    if (data.value && data.value.success) {
      personalInfo.value = { 
        ...editedInfo.value, 
        password: undefined, 
        confirmPassword: undefined 
      }
      isEditing.value = false
      alert('개인정보가 성공적으로 업데이트되었습니다.')
      refresh() // 사용자 정보 새로고침
    } else {
      throw new Error(data.value.message || '사용자 정보 업데이트에 실패했습니다.')
    }
  } catch (error) {
    console.error('사용자 정보 업데이트 중 오류 발생:', error)
    alert('사용자 정보 업데이트 중 오류가 발생했습니다.')
  }
}
</script>