<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="pending" class="flex justify-center items-center h-64">
      <Icon icon="eos-icons:loading" class="text-blue-500" width="48" height="48" />
    </div>
    <div v-else-if="error" class="alert alert-danger" role="alert">
      <p class="font-bold">에러 발생</p>
      <p>{{ error }}</p>
    </div>
    <div v-else-if="wiki" class="card">
      <div class="card-padded">
        <h1 class="section-title">
          <Icon icon="mdi:file-document-outline" class="mr-2 text-blue-500" width="36" height="36" />
          {{ wiki.title }}
        </h1>
        <div class="flex items-center text-sm text-muted mb-4">
          <Icon icon="mdi:calendar" class="mr-1" />
          <span class="mr-4">{{ formatDate(wiki.updatedAt) }}</span>
        </div>
        <div class="prose dark:prose-invert max-w-none" v-html="wiki.content"></div>
        
        <!-- 버튼 그룹 -->
        <div class="mt-8 flex flex-wrap justify-between items-center">
          <div v-if="auth.isLoggedIn && auth.user" class="space-x-4 mb-4 sm:mb-0">
            <NuxtLink :to="`/wiki/edit?id=${wiki.id}`" class="btn-primary btn-icon">
              <Icon icon="mdi:pencil" class="mr-2" />
              수정하기
            </NuxtLink>
            <button @click="deleteWiki" class="btn-danger btn-icon">
              <Icon icon="mdi:delete" class="mr-2" />
              삭제하기
            </button>
          </div>
          <NuxtLink to="/wiki" class="btn-secondary btn-icon">
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
import { formatDate } from '~/utils/dateFormatter'

const { auth } = useAuth()

const props = defineProps({
  apiEndpoint: {
    type: String,
    required: true
  }
})

const route = useRoute()
const router = useRouter()
const { openModal, showConfirm } = useModal()

const wiki = ref(null)
const pending = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const response = await $fetch(`${props.apiEndpoint}?id=${route.query.id}`)

    wiki.value = response
  } catch (fetchError) {
    error.value = '위키 페이지를 불러오는데 실패했습니다.'
    console.error(fetchError)
  } finally {
    pending.value = false
  }
})

/**
 * 위키 페이지를 삭제하는 비동기 함수입니다.
 * 사용자에게 삭제 확인을 요청하고, 확인 시 API를 통해 위키 페이지를 삭제합니다.
 * 성공 시 성공 모달을 띄우고 위키 목록 페이지로 이동하며, 실패 시 오류 모달을 띄웁니다.
 */
async function deleteWiki() {
  const confirmDelete = await showConfirm(
    '위키 페이지 삭제',
    '정말로 이 위키 페이지를 삭제하시겠습니까?'
  );
  
  if (confirmDelete) {
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