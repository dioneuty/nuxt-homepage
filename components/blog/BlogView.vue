<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="pending" class="flex justify-center items-center h-64">
      <Icon icon="eos-icons:loading" class="text-blue-500" width="48" height="48" />
    </div>
    <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
      <p class="font-bold">에러 발생</p>
      <p>{{ error }}</p>
    </div>
    <div v-else-if="post" class="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
      <div class="p-6">
        <h1 class="text-3xl font-bold mb-4 dark:text-white flex items-center">
          <Icon icon="mdi:file-document-outline" class="mr-2 text-blue-500" width="36" height="36" />
          {{ post.title }}
        </h1>
        <div class="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
          <Icon icon="mdi:calendar" class="mr-1" />
          <span class="mr-4">{{ formatDate(post.createdAt) }}</span>
          <Icon icon="mdi:folder-outline" class="mr-1" />
          <span>{{ post.category?.name || '없음' }}</span>
        </div>
        <div class="prose dark:prose-invert max-w-none" v-html="post.content"></div>
        
        
        <!-- 버튼 그룹 -->
        <div class="mt-8 flex flex-wrap justify-between items-center">
          <div class="space-x-4 mb-4 sm:mb-0">
            <NuxtLink :to="`${editLink}?id=${post.id}`" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
              <Icon icon="mdi:pencil" class="mr-2" />
              {{ editButtonText }}
            </NuxtLink>
            <button @click="deletePost" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200">
              <Icon icon="mdi:delete" class="mr-2" />
              {{ deleteButtonText }}
            </button>
          </div>
          <NuxtLink :to="listLink" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 transition-colors duration-200">
            <Icon icon="mdi:arrow-left" class="mr-2" />
            {{ listButtonText }}
          </NuxtLink>
        </div>
      </div>
    </div>
    <!-- 이전 글, 다음 글 네비게이션 추가 -->
    <div class="mt-8 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
      <div class="flex flex-col divide-y divide-gray-200 dark:divide-gray-600">
        <NuxtLink v-if="prevPost" :to="`${$route.path}?id=${prevPost.id}`" class="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200">
          <div class="flex items-center text-gray-700 dark:text-gray-300">
            <Icon icon="mdi:chevron-left" class="mr-2" />
            <span class="truncate">이전 글:</span>
          </div>
          <span class="truncate text-blue-600 dark:text-blue-400 ml-2">{{ prevPost.title }}</span>
        </NuxtLink>
        <NuxtLink v-if="nextPost" :to="`${$route.path}?id=${nextPost.id}`" class="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200">
          <div class="flex items-center text-gray-700 dark:text-gray-300">
            <span class="truncate">다음 글:</span>
          </div>
          <div class="flex items-center text-blue-600 dark:text-blue-400">
            <span class="truncate mr-2">{{ nextPost.title }}</span>
            <Icon icon="mdi:chevron-right" />
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { useModal } from '~/composables/useModal'
import { useRouter } from 'vue-router'
import { ref, onMounted, watch, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import { formatDate } from '~/utils/dateFormatter'

const props = defineProps({
  editButtonText: { type: String, default: '수정하기' },
  deleteButtonText: { type: String, default: '삭제하기' },
  listButtonText: { type: String, default: '목록으로' },
  editLink: { type: String, required: true },
  listLink: { type: String, required: true },
  apiEndpoint: { type: String, required: true },
  id: { type: String, required: true }
})

const router = useRouter()
const { openModal } = useModal()
const route = useRoute()

const post = ref(null)
const pending = ref(false)
const error = ref(null)
const prevPost = ref(null)
const nextPost = ref(null)

/**
 * 블로그 게시글 데이터와 이전/다음 글 정보를 비동기적으로 가져옵니다.
 * API 호출 중 로딩 상태를 'pending'으로, 에러 발생 시 'error' 상태를 업데이트합니다.
 */
async function fetchData() {
  pending.value = true
  try {
    const { data } = await useFetch(`${props.apiEndpoint}?id=${props.id}`)
    post.value = data.value
    
    // 이전 글과 다음 글 데이터 가져오기
    const { data: navigationData } = await useFetch(`${props.apiEndpoint}?type=navigation&id=${props.id}`)
    prevPost.value = navigationData.value?.prev || null
    nextPost.value = navigationData.value?.next || null
  } catch (e) {
    error.value = e
  } finally {
    pending.value = false
  }
}

onBeforeMount(fetchData)
onMounted(fetchData)

/**
 * `props.id`가 변경될 때마다 `fetchData` 함수를 호출합니다.
 * 이는 URL 쿼리 파라미터로 게시글 ID가 변경될 때 새로운 게시글을 불러오기 위함입니다.
 * @param {string} newId - 새로 변경된 게시글 ID.
 */
watch(() => props.id, (newId) => {
  if (newId) {
    fetchData()
  }
})

/**
 * 게시글 삭제를 처리하는 함수입니다.
 * 사용자에게 삭제 확인 모달을 띄우고, 확인 시 API를 통해 게시글을 삭제합니다.
 * 성공 시 성공 모달을 띄우고 목록 페이지로 이동하며, 실패 시 오류 모달을 띄웁니다.
 */
async function deletePost() {
  openModal('확인', '정말로 이 게시글을 삭제하시겠습니까?', async (confirmed) => {
    if (confirmed) {
      try {
        const { error } = await useFetch(`${props.apiEndpoint}?id=${props.id}`, {
          method: 'DELETE'
        })

        if (error.value) {
          openModal('오류', '게시글 삭제에 실패했습니다.')
          return
        }

        openModal('성공', '게시글이 성공적으로 삭제되었습니다.', () => {
          router.push(props.listLink)
        })
      } catch (error) {
        openModal('오류', '서버 오류가 발생했습니다.')
      }
    }
  }, true)
}
</script>