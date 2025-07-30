<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="pending" class="loading-container">
      <Icon icon="eos-icons:loading" class="text-blue-500" width="48" height="48" />
    </div>
    <div v-else-if="error" class="alert alert-danger" role="alert">
      <p class="font-bold">에러 발생</p>
      <p>{{ error }}</p>
    </div>
    <div v-else-if="post" class="card">
      <div class="card-padded">
        <h1 class="section-title">
          <Icon icon="mdi:file-document-outline" class="mr-2 text-blue-500" width="36" height="36" />
          {{ post.title }}
        </h1>
        <div class="flex items-center text-sm text-muted mb-4">
          <Icon icon="mdi:calendar" class="mr-1" />
          <span class="mr-4">{{ formatDate(post.createdAt) }}</span>
          <Icon icon="mdi:folder-outline" class="mr-1" />
          <span>{{ post.category?.name || '없음' }}</span>
        </div>
        <SafeHtml 
          :content="post.content" 
          type="rich" 
          container-class="prose dark:prose-invert max-w-none"
        />
        
        
        <!-- 버튼 그룹 -->
        <div class="mt-8 flex flex-wrap justify-between items-center">
          <div class="space-x-4 mb-4 sm:mb-0">
            <NuxtLink :to="`${editLink}?id=${post.id}`" class="btn-primary btn-icon">
              <Icon icon="mdi:pencil" class="mr-2" />
              {{ editButtonText }}
            </NuxtLink>
            <button @click="deletePost" class="btn-danger btn-icon">
              <Icon icon="mdi:delete" class="mr-2" />
              {{ deleteButtonText }}
            </button>
          </div>
          <NuxtLink :to="listLink" class="btn-secondary btn-icon">
            <Icon icon="mdi:arrow-left" class="mr-2" />
            {{ listButtonText }}
          </NuxtLink>
        </div>
      </div>
    </div>
    <!-- 이전 글, 다음 글 네비게이션 추가 -->
    <div class="mt-8 card overflow-hidden">
      <div class="divided-container">
        <NuxtLink v-if="prevPost" :to="`${$route.path}?id=${prevPost.id}`" class="nav-link">
          <div class="nav-link-text">
            <Icon icon="mdi:chevron-left" class="mr-2" />
            <span class="truncate">이전 글:</span>
          </div>
          <span class="truncate link ml-2">{{ prevPost.title }}</span>
        </NuxtLink>
        <NuxtLink v-if="nextPost" :to="`${$route.path}?id=${nextPost.id}`" class="nav-link">
          <div class="nav-link-text">
            <span class="truncate">다음 글:</span>
          </div>
          <div class="flex items-center link">
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
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { formatDate } from '~/utils/dateFormatter'
import { useBlogPosts } from '~/composables/useBlogPosts'
import { useConfirmDelete } from '~/composables/useConfirmDelete'
import SafeHtml from '~/components/common/SafeHtml.vue'

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

const { post, pending, error, prevPost, nextPost } = useBlogPosts(computed(() => props.apiEndpoint), computed(() => props.id))

const { confirmAndDelete } = useConfirmDelete(
  async () => {
    const { error: deleteError } = await useFetch(`${props.apiEndpoint}?id=${props.id}`, {
      method: 'DELETE'
    })
    if (deleteError.value) {
      throw deleteError.value
    }
  },
  () => {
    openModal('성공', '게시글이 성공적으로 삭제되었습니다.', () => {
      router.push(props.listLink)
    })
  },
  () => {
    openModal('오류', '게시글 삭제에 실패했습니다.')
  }
)

// deletePost 함수를 useConfirmDelete의 confirmAndDelete로 대체
const deletePost = confirmAndDelete
</script>