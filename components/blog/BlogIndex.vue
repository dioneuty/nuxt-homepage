<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="page-title flex items-center">
      <Icon icon="mdi:post-outline" class="mr-3 text-blue-500" width="40" height="40" />
      {{ title }}
    </h1>
    
    <div v-if="initialLoading" class="loading-container">
      <Icon icon="eos-icons:loading" class="text-blue-500" width="48" height="48" />
    </div>
    
    <div v-else-if="error" class="alert-danger" role="alert">
      <p class="font-bold">에러 발생</p>
      <p>{{ error }}</p>
    </div>
    
    <div v-else>
      <div v-if="posts.length === 0" class="empty-state">
        <Icon icon="mdi:folder-open-outline" class="empty-state-icon" width="64" height="64" />
        <p>{{ emptyMessage }}</p>
      </div>
      
      <div v-else class="blog-grid">
        <div v-for="post in posts" :key="post.id" 
             class="blog-card"
             @click="navigateToPost(post.id)">
          <div class="blog-card-content">
            <h2 class="blog-card-title">
              <span class="blog-card-title-text">
                <Icon icon="mdi:file-document-outline" class="mr-2 group-hover:text-blue-500" />
                {{ post.title }}
              </span>
            </h2>
            <p class="blog-card-excerpt" v-html="post.content.substring(0, 100) + '...'"></p>
            <div class="blog-card-meta">
              <Icon icon="mdi:calendar" class="mr-1" />
              <span>{{ formatDate(post.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="mt-8 text-right">
      <NuxtLink :to="writeLink" class="btn-primary btn-icon">
        <Icon icon="mdi:pencil" class="mr-2" />
        {{ writeButtonText }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { formatDate } from '~/utils/dateFormatter'
import { useListData } from '~/composables/useListData'
import { useUIStates } from '~/composables/useUIStates'

const props = defineProps({
  title: { type: String, default: '블로그' },
  emptyMessage: { type: String, default: '게시물이 존재하지 않습니다.' },
  writeButtonText: { type: String, default: '글쓰기' },
  writeLink: { type: String, default: '/blog/write' },
  postLink: { type: String, default: '/blog/view' },
  apiEndpoint: { type: String, required: true }
})

const router = useRouter()

// useListData 컴포저블을 사용하여 목록 데이터 관리
const {
  posts,
  initialLoading,
  error
} = useListData(props.apiEndpoint, {
  enableInfiniteScroll: false,
  enableSearch: false,
  enableSort: false,
  contentType: 'posts'
})

// useUIStates 컴포저블을 사용하여 UI 상태 관리
const uiStates = useUIStates({
  autoReset: false, // 블로그 목록에서는 자동 리셋 비활성화
  logErrors: true
})

/**
 * 게시글 상세 페이지로 이동하는 함수입니다.
 * `postLink` prop을 기반으로 URL을 구성하여 해당 게시글로 라우팅합니다.
 * @param {number} postId - 이동할 게시글의 ID.
 */
function navigateToPost(postId) {
  router.push(`${props.postLink}?id=${postId}`)
}
</script>