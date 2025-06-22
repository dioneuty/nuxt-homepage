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
            <Icon :icon="boardIcon" class="mr-2 text-blue-500" width="36" height="36" />
            {{ post.title }}
          </h1>
          <slot name="extra-info" :post="post"></slot>
          <div class="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Icon icon="mdi:account" class="mr-1" />
            <span class="mr-4">{{ post.author }}</span>
            <Icon icon="mdi:calendar" class="mr-1" />
            <span>{{ formatDate(post.createdAt) }}</span>
          </div>
          <div class="prose dark:prose-invert max-w-none" v-html="post.content"></div>
        </div>
      </div>
      
      <!-- 답변 목록 -->
      <div v-if="post && post.replies && post.replies.length > 0" class="mt-8">
        <h2 class="text-2xl font-bold mb-4 dark:text-white flex items-center">
          <Icon icon="mdi:message-reply-text" class="mr-2 text-green-500" width="24" height="24" />
          답변 ({{ post.replies.length }})
        </h2>
        <div v-for="reply in post.replies" :key="reply.id" class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
          <div class="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
            <Icon icon="mdi:account" class="mr-1" />
            <span class="font-bold mr-4">{{ reply.author }}</span>
            <Icon icon="mdi:calendar" class="mr-1" />
            <span>{{ formatDate(reply.createdAt) }}</span>
          </div>
          <div class="prose dark:prose-invert max-w-none" v-html="reply.content"></div>
        </div>
      </div>
      
      <!-- 버튼 그룹 -->
      <div v-if="post" class="mt-8 flex flex-wrap justify-end items-center space-x-4">
        <NuxtLink :to="`/${boardType}`" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 transition-colors duration-200">
          <Icon icon="mdi:arrow-left" class="mr-2" />
          목록으로
        </NuxtLink>
        <slot name="edit-button"></slot>
        <button @click="openReply" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200">
          <Icon icon="mdi:reply" class="mr-2" />
          답변하기
        </button>
        <button @click="deletePost" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200">
          <Icon icon="mdi:delete" class="mr-2" />
          삭제하기
        </button>
      </div>
      
      <!-- 이전 글, 다음 글 네비게이션 추가 -->
      <div v-if="post" class="mt-8 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
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
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useModal } from '~/composables/useModal'
  import { useReplyModal } from '~/composables/useReplyModal'
  import { Icon } from '@iconify/vue'
  import { formatDate } from '~/utils/dateFormatter'
  
  const props = defineProps({
    boardType: {
      type: String,
      required: true
    },
    apiEndpoint: {
      type: String,
      required: true
    },
    boardIcon: {
      type: String,
      required: true
    },
    id: {
      type: Number,
      required: true
    }
  })
  
  const route = useRoute()
  const router = useRouter()
  const { openModal } = useModal()
  const { openReplyModal } = useReplyModal()
  const isMobile = ref(false)
  
  const post = ref(null)
  const error = ref(null)
  const pending = ref(false)
  const replyContent = ref('')
  const prevPost = ref(null)
  const nextPost = ref(null)
  
  /**
   * 사용자에게 확인 모달을 표시하고, 사용자의 응답에 따라 콜백 함수를 실행합니다.
   * @param {string} title 모달 제목
   * @param {string} message 모달 메시지
   * @param {function} onConfirm 사용자가 확인을 눌렀을 때 실행될 콜백 함수
   * @param {function} onCancel 사용자가 취소를 눌렀을 때 실행될 콜백 함수 (선택 사항)
   */
  function showConfirmation(title, message, onConfirm, onCancel = () => {})
  {
    openModal(title, message, (confirmed) => {
      if (confirmed) {
        onConfirm();
      } else {
        onCancel();
      }
    }, true);
  }
  
  /**
   * 게시글 데이터와 이전/다음 글 정보를 비동기적으로 가져옵니다.
   * API 호출 중 로딩 상태를 'pending'으로, 에러 발생 시 'error' 상태를 업데이트합니다.
   */
  async function fetchData() {
    pending.value = true
    error.value = null
    try {
      const [postResponse, navigationResponse] = await Promise.all([
        $fetch(props.apiEndpoint, {
          method: 'GET',
          query: { id: props.id }
        }),
        $fetch(props.apiEndpoint, {
          method: 'GET',
          query: { id: props.id, type: 'navigation' }
        }).catch(() => ({ prev: null, next: null })) // navigation API가 없을 경우 에러 방지
      ])

      post.value = postResponse
      prevPost.value = navigationResponse?.prev || null
      nextPost.value = navigationResponse?.next || null
    } catch (e) {
      error.value = e.message || '데이터를 불러오는데 실패했습니다.'
      console.error('Fetch error:', e)
    } finally {
      pending.value = false
    }
  }

  /**
   * 컴포넌트 초기화 함수.
   * 모바일 여부를 확인하고, 윈도우 리사이즈 이벤트 리스너를 추가하며, 데이터를 가져옵니다.
   */
  function init() {
    checkMobile()
    window.addEventListener('resize', checkMobile)
    fetchData()
  }
  
  onMounted(init)
  
  /**
   * 현재 뷰포트 너비를 기준으로 모바일 환경인지 여부를 확인하여 `isMobile` 상태를 업데이트합니다.
   */
  function checkMobile() {
    isMobile.value = window.innerWidth < 640
  }
  
  /**
   * 게시글 삭제를 처리하는 함수입니다.
   * 사용자에게 삭제 확인 모달을 띄우고, 확인 시 API를 통해 게시글을 삭제한 후
   * 성공 또는 실패 메시지를 표시하고 게시판 목록으로 이동합니다.
   */
  async function deletePost() {
    showConfirmation('확인', '정말로 이 게시글을 삭제하시겠습니까?', async () => {
      try {
        await $fetch(props.apiEndpoint, {
          method: 'DELETE',
          body: { id: props.id }
        })

        showConfirmation('성공', '게시글이 성공적으로 삭제되었습니다.', () => {
          router.push(`/${props.boardType}`)
        })
      } catch (error) {
        showConfirmation('오류', '서버 오류가 발생했습니다.')
      }
    })
  }
  
  /**
   * 답변 작성 모달을 엽니다.
   * 모달에서 입력된 답변 내용과 작성자 정보를 받아 `submitReply` 함수를 호출합니다.
   */
  function openReply() {
    openReplyModal('답변 작성', 
      async (data) => {
        if (data && data.content && data.author) {
          await submitReply(data)
        } else if (data && data.content && !data.author) {
          showConfirmation('오류', '작성자를 입력해주세요.')
        }
      }
    )
  }

  /**
   * 답변을 서버에 제출하는 함수입니다.
   * 성공 시 성공 모달을 띄우고 게시글 데이터를 다시 불러옵니다. 실패 시 오류 모달을 띄웁니다.
   * @param {object} replyData - 제출할 답변 데이터 (content, author 포함).
   */
  async function submitReply(replyData) {
    try {
      await $fetch(props.apiEndpoint, {
        method: 'POST',
        body: {
          parentId: props.id,
          content: replyData.content,
          author: replyData.author
        }
      })

      showConfirmation('성공', '답변이 성공적으로 등록되었습니다.', () => {
        fetchData()
      })
    } catch (error) {
      showConfirmation('오류', '서버 오류가 발생했습니다.')
    }
  }
  
  watch(() => props.id, (newId) => {
    if (newId) {
      fetchData()
    }
  })
  </script>
  
  <style scoped>
  @media (max-width: 640px) {
    :deep(.prose iframe) {
      width: 100vw;
      align-self: 16 / 9;
    }
    :deep(.prose :not(iframe)) {
      margin-left: -1rem;
      padding: 2rem;
    }
  }
  </style>