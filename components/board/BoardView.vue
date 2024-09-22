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
      
      <!-- 답변 섹션 추가 -->
      <div v-if="post && post.reply" class="mt-8 bg-gray-100 dark:bg-gray-700 p-6 rounded-lg">
        <h2 class="text-2xl font-bold mb-4 dark:text-white flex items-center">
          <Icon icon="mdi:reply" class="mr-2 text-green-500" width="24" height="24" />
          답변
        </h2>
        <div class="prose dark:prose-invert max-w-none" v-html="post.reply"></div>
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
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useModal } from '~/composables/useModal'
  import { useReplyModal } from '~/composables/useReplyModal'
  import { Icon } from '@iconify/vue'
  
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
  
  const { data: post, error, pending } = await useFetch(props.apiEndpoint, {
    method: 'GET',
    params: { id: props.id },
    lazy: true
  })
  
  const replyContent = ref('')
  
  const prevPost = ref(null)
  const nextPost = ref(null)
  
  async function fetchData() {
    pending.value = true
    try {
      const [postResponse, navigationResponse] = await Promise.all([
        useFetch(props.apiEndpoint, {
          method: 'GET',
          query: { id: props.id }
        }),
        useFetch(props.apiEndpoint, {
          method: 'GET',
          query: { id: props.id, type: 'navigation' }
        })
      ])

      post.value = postResponse.data.value
      prevPost.value = navigationResponse.data.value?.prev || null
      nextPost.value = navigationResponse.data.value?.next || null
    } catch (e) {
      error.value = e
    } finally {
      pending.value = false
    }
  }

  function init() {
    checkMobile()
    window.addEventListener('resize', checkMobile)
    fetchData()
  }
  
  onMounted(init)
  onBeforeMount(init)
  
  function checkMobile() {
    isMobile.value = window.innerWidth < 640
  }
  
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  async function deletePost() {
    openModal('확인', '정말로 이 게시글을 삭제하시겠습니까?', async (confirmed) => {
      if (confirmed) {
        try {
          const { error } = await useFetch(props.apiEndpoint, {
            method: 'DELETE',
            body: JSON.stringify({ id })
          })

          if (error.value) {
            openModal('오류', '게시글 삭제에 실패했습니다.')
            return
          }

          openModal('성공', '게시글이 성공적으로 삭제되었습니다.', () => {
            router.push(`/${props.boardType}`)
          })
        } catch (error) {
          openModal('오류', '서버 오류가 발생했습니다.')
        }
      }
    }, true)
  }
  
  function openReply() {
    openReplyModal('답변 작성', 
      async (content) => {
        replyContent.value = content
        if (content) {
          await submitReply()
        }
      },
      true,
      { replyContent }
    )
  }

  async function submitReply() {
    try {
      const { error } = await useFetch(props.apiEndpoint, {
        method: 'POST',
        body: JSON.stringify({
          id: id,
          type: 'reply',
          content: replyContent.value
        })
      })

      if (error.value) {
        openModal('오류', '답변 등록에 실패했습니다.')
        return
      }

      openModal('성공', '답변이 성공적으로 등록되었습니다.', () => {
        location.reload()
      })
    } catch (error) {
      openModal('오류', '서버 오류가 발생했습니다.')
    }
  }
  
  watch(() => route.query.id, (newId) => {
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