<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="pending" class="flex justify-center items-center h-64">
      <Icon icon="eos-icons:loading" class="text-blue-500" width="48" height="48" />
    </div>
    <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
      <p class="font-bold">에러 발생</p>
      <p>{{ error }}</p>
    </div>
    <div v-else-if="wiki" class="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
      <div class="p-6">
        <h1 class="text-3xl font-bold mb-4 dark:text-white flex items-center">
          <Icon icon="mdi:file-document-outline" class="mr-2 text-blue-500" width="36" height="36" />
          {{ wiki.title }}
        </h1>
        <div class="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
          <Icon icon="mdi:calendar" class="mr-1" />
          <span class="mr-4">{{ formatDate(wiki.updatedAt) }}</span>
        </div>
        <div class="prose dark:prose-invert max-w-none" v-html="wiki.content"></div>
        
        <!-- 버튼 그룹 -->
        <div class="mt-8 flex flex-wrap justify-between items-center">
          <div v-if="auth.isLoggedIn && auth.user" class="space-x-4 mb-4 sm:mb-0">
            <NuxtLink :to="`/wiki/edit?id=${wiki.id}`" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
              <Icon icon="mdi:pencil" class="mr-2" />
              수정하기
            </NuxtLink>
            <button @click="deleteWiki" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200">
              <Icon icon="mdi:delete" class="mr-2" />
              삭제하기
            </button>
          </div>
          <NuxtLink to="/wiki" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 transition-colors duration-200">
            <Icon icon="mdi:arrow-left" class="mr-2" />
            목록으로
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useModal } from '~/composables/useModal'
import { Icon } from '@iconify/vue'
import { useAuth } from '~/composables/useAuth'

const { auth } = useAuth()

const props = defineProps({
  apiEndpoint: {
    type: String,
    required: true
  }
})

const route = useRoute()
const router = useRouter()
const { openModal } = useModal()

const wiki = ref(null)
const pending = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const response = await $fetch(`${props.apiEndpoint}?id=${route.query.id}`)
    console.log('Wiki data:', response) // 데이터 확인
    wiki.value = response
  } catch (fetchError) {
    error.value = '위키 페이지를 불러오는데 실패했습니다.'
    console.error(fetchError)
  } finally {
    pending.value = false
  }
})

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

async function deleteWiki() {
  if (confirm('정말로 이 위키 페이지를 삭제하시겠습니까?')) {
    try {
      await $fetch(`${props.apiEndpoint}?id=${route.query.id}`, {
        method: 'DELETE'
      })
      openModal('성공', '위키 페이지가 성공적으로 삭제되었습니다.', () => {
        router.push('/wiki')
      })
    } catch (error) {
      console.error('Error deleting wiki:', error)
      openModal('오류', '위키 페이지 삭제에 실패했습니다.')
    }
  }
}
</script>