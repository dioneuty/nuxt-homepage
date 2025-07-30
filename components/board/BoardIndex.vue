<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="page-title text-center flex items-center justify-center">
      <Icon :icon="boardIcon" class="mr-2" />
      {{ boardTitle }}
    </h1>
    <div class="card overflow-hidden overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead :class="headerColorClass">
          <draggable v-model="localHeaders" item-key="key" tag="tr" @end="onDragEnd">
            <template #item="{ element: header }">
              <th 
                scope="col" 
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider dark:text-gray-200 cursor-move border-r border-gray-300 dark:border-gray-600 last:border-r-0" 
                :class="header.class" 
                @click="header.sortable !== false && toggleSort(header.key)"
              >
                <div class="flex items-center">
                  <Icon :icon="header.icon" class="inline mr-1" />
                  {{ header.label }}
                  <Icon v-if="header.sortable !== false" :icon="header.sortIcon" class="ml-1" />
                </div>
              </th>
            </template>
          </draggable>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:text-white">
          <template v-if="initialLoading">
            <tr v-for="i in itemsPerPage" :key="i" class="h-16">
              <td :colspan="localHeaders.length" class="px-6 py-4 text-center">
                <div v-if="i === Math.ceil(itemsPerPage / 2)" class="flex justify-center items-center h-full">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                  <span class="ml-2">로딩 중...</span>
                </div>
              </td>
            </tr>
          </template>
          <template v-else-if="posts && posts.length">
            <tr v-for="post in posts" :key="post.id" class="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" @click="goToPostDetail(post.id)">
              <td v-for="header in localHeaders" :key="header.key" class="px-6 py-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-700 last:border-r-0" :class="header.class">
                <template v-if="header.key === 'title'">
                  <span class="mobile-meta">
                    <Icon icon="mdi:account" class="inline mr-1" />{{ post.author }} | 
                    <Icon icon="mdi:calendar" class="inline mr-1" />{{ formatDate(post.createdAt) }}
                  </span>
                  <span class="truncate block max-w-xs sm:max-w-none" :class="{ 'pl-5': post.parentId }">
                    <Icon v-if="post.parentId" icon="mdi:subdirectory-arrow-right" class="inline mr-1 text-gray-500" />
                    <!-- Future enhancement: 글 썸네일 표시 기능 추가 -->
                    <Icon v-else icon="mdi:text" class="inline mr-1" />
                    {{ post.title || '(제목 없음)' }}
                  </span>
                </template>
                <template v-else-if="header.key === 'createdAt'">
                  {{ formatDate(post.createdAt) }}
                </template>
                <template v-else>
                  {{ post[header.key] }}
                </template>
              </td>
            </tr>
          </template>
          <template v-else>
            <tr>
              <td :colspan="localHeaders.length" class="px-6 py-4 text-center">
                게시물이 없습니다.
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <div class="mt-6" v-if="showWriteButton">
      <slot name="write-button">
        <NuxtLink :to="`/${boardType}/write`" class="btn-primary btn-icon">
          <Icon icon="mdi:pencil-plus" class="mr-2" />
          새 글 작성
        </NuxtLink>
      </slot>
    </div>
    
    <SearchBar @search="handleSearch" />
    
    <Pagination 
      v-if="!isMobile"
      :total-items="totalItems" 
      :items-per-page="itemsPerPage" 
      :current-page="currentPage"
      @page-change="handlePageChange"
      @items-per-page-change="handleItemsPerPageChange"
    />
    
    <!-- Mobile Infinite Scroll Loading Indicator and Sentinel -->
    <div v-if="isMobile && hasMorePosts && !initialLoading" class="text-center py-4">
      <button @click="loadMorePosts" :disabled="loadingMore" class="btn-primary">
        <span v-if="loadingMore">
          <Icon icon="mdi:loading" class="animate-spin mr-2" /> 로딩 중...
        </span>
        <span v-else>더보기</span>
      </button>
    </div>
    <div v-if="isMobile && !hasMorePosts && !initialLoading && posts.length > 0" class="load-more-message">
      모든 게시물을 불러왔습니다.
    </div>
    <div v-if="isMobile" class="infinite-scroll-sentinel" :ref="infiniteScrollSentinel"></div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SearchBar from '~/components/board/SearchBar.vue'
import Pagination from '~/components/board/Pagination.vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import draggable from 'vuedraggable'
import { useAuth } from '~/composables/useAuth'
import { formatDate } from '~/utils/dateFormatter'
import { useListData } from '~/composables/useListData'
import { useUIStates } from '~/composables/useUIStates'

/**
 * 게시물 목록 및 페이지네이션 관련 상태를 초기화합니다.
 * 주로 새로운 검색, 정렬 또는 전체 페이지 새로고침 시 사용됩니다.
 */
function resetPaginationAndLoadingState() {
  initialLoading.value = true;
  loadedPosts.value = [];
  currentPage.value = 1;
  hasMorePosts.value = true;
}

const props = defineProps({
  boardType: { // 게시판 타입
    type: String,
    required: true
  },
  boardTitle: { // 게시판 제목
    type: String,
    required: true
  },
  boardIcon: { // 게시판 아이콘
    type: String,
    required: true
  },
  apiEndpoint: { // 게시판 데이터 엔드포인트
    type: String,
    required: true
  },
  headerColorClass: { // 헤더 색상 클래스
    type: String,
    default: 'bg-green-100 dark:bg-green-800'
  },
  tableHeaders: { // 테이블 헤더 목록
    type: Array,
    required: true
  },
  showWriteButton: { // 글쓰기 버튼 표시 여부
    type: Boolean,
    default: true
  },
  isAdminBoard: { // 관리자 게시판 여부
    type: Boolean,
    default: false
  }
})

const localHeaders = ref([...props.tableHeaders]) // 로컬 헤더 목록

// useListData 컴포저블을 사용하여 목록 데이터 관리
const {
  posts,
  totalItems,
  itemsPerPage,
  currentPage,
  initialLoading,
  loadingMore,
  hasMorePosts,
  error,
  searchParams,
  sortColumn,
  sortOrder,
  handleSearch,
  toggleSort,
  getSortIcon,
  handlePageChange,
  handleItemsPerPageChange,
  loadMorePosts,
  infiniteScrollSentinel,
  isMobile
} = useListData(props.apiEndpoint, {
  enableInfiniteScroll: true,
  enableSearch: true,
  enableSort: true,
  isAdminBoard: props.isAdminBoard,
  itemsPerPage: 10,
  contentType: 'posts'
})

// useUIStates 컴포저블을 사용하여 UI 상태 관리
const uiStates = useUIStates({
  autoReset: false,
  logErrors: true
})

/**
 * 정렬 가능한 헤더 목록을 계산합니다.
 * @returns {Array} 정렬 가능한 헤더 목록
 */
const sortedHeaders = computed(() => {
  return localHeaders.value.map(header => ({
    ...header,
    sortable: header.sortable !== false,
    sortIcon: getSortIcon(header.key)
  }))
})

//로그인한 유저이면서 role이 admin인 유저만 보도록 하기
const { user, isLoggedIn } = useAuth()



const router = useRouter()

/**
 * 게시글 상세 페이지로 이동하는 함수입니다.
 * @param {number} postId - 이동할 게시글의 ID.
 */
function goToPostDetail(postId) {
  router.push(`/${props.boardType}/view?id=${postId}`)
}

/**
 * 드래그 앤 드롭으로 테이블 헤더 순서 변경이 완료되었을 때 호출되는 핸들러 함수입니다.
 * 변경된 헤더 순서를 로컬 스토리지에 저장합니다.
 */
function onDragEnd() {
  // 변경된 헤더 순서를 로컬 스토리지에 저장
  localStorage.setItem(`${props.boardType}_headerOrder`, JSON.stringify(localHeaders.value.map(function(h) { return h.key })))
}

onMounted(function() {
  // 저장된 헤더 순서 불러오기
  const savedOrder = JSON.parse(localStorage.getItem(`${props.boardType}_headerOrder`))
  if (savedOrder) {
    localHeaders.value = savedOrder.map(function(key) { 
      return props.tableHeaders.find(function(h) { return h.key === key }) 
    }).filter(Boolean)
  }
})
</script>

<style scoped>
/* 필요한 경우 추가 스타일 */
</style>