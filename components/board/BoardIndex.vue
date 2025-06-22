<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6 dark:text-white text-center flex items-center justify-center">
      <Icon :icon="boardIcon" class="mr-2" />
      {{ boardTitle }}
    </h1>
    <div class="bg-white dark:bg-gray-800 dark:text-white shadow-md rounded-lg overflow-hidden overflow-x-auto">
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
                  <span class="block sm:hidden text-xs text-gray-500 dark:text-gray-400">
                    <Icon icon="mdi:account" class="inline mr-1" />{{ post.author }} | 
                    <Icon icon="mdi:calendar" class="inline mr-1" />{{ formatDate(post.createdAt) }}
                  </span>
                  <span class="truncate block max-w-xs sm:max-w-none" :class="{ 'pl-5': post.parentId }">
                    <Icon v-if="post.parentId" icon="mdi:subdirectory-arrow-right" class="inline mr-1 text-gray-500" />
                    <!-- TODO: JGM 글 썸네일 표시 기능 추가
                    - post 객체에 썸네일 이미지 URL 필드가 있다고 가정
                    - 해당 URL을 사용하여 <img> 태그 또는 배경 이미지 스타일로 썸네일 표시
                    - 썸네일이 없을 경우 기본 이미지 또는 아이콘 표시 고려
                    -->
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
        <NuxtLink :to="`/${boardType}/write`" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
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
      <button @click="loadMorePosts" :disabled="loadingMore" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
        <span v-if="loadingMore">
          <Icon icon="mdi:loading" class="animate-spin mr-2" /> 로딩 중...
        </span>
        <span v-else>더보기</span>
      </button>
    </div>
    <div v-if="isMobile && !hasMorePosts && !initialLoading && loadedPosts.length > 0" class="text-center py-4 text-gray-500 dark:text-gray-400">
      모든 게시물을 불러왔습니다.
    </div>
    <div v-if="isMobile" class="infinite-scroll-sentinel h-1" ref="infiniteScrollSentinel"></div>

  </div>
</template>

<script setup>
import { ref, watchEffect, computed, onMounted, onUnmounted } from 'vue'
import SearchBar from '~/components/board/SearchBar.vue'
import Pagination from '~/components/board/Pagination.vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import draggable from 'vuedraggable'
import { useAuth } from '~/composables/useAuth'
import { formatDate } from '~/utils/dateFormatter'
import { useIsMobile } from '~/composables/useIsMobile' // NEW IMPORT

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

const totalItems = ref(0) // 총 게시물 수
const itemsPerPage = ref(10) // 페이지당 게시물 수
const currentPage = ref(1) // 현재 페이지
const searchParams = ref({ type: 'title', text: '' }) // 검색 파라미터
const sortColumn = ref('') // 정렬 컬럼
const sortOrder = ref('asc') // 정렬 순서

const localHeaders = ref([...props.tableHeaders]) // 로컬 헤더 목록

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

/**
 * 주어진 키(key)에 해당하는 정렬 아이콘을 반환합니다.
 * 현재 정렬 컬럼과 일치하지 않으면 일반 정렬 아이콘을, 일치하면 오름차순 또는 내림차순 아이콘을 반환합니다.
 * @param {string} key - 헤더의 키.
 * @returns {string} Iconify 아이콘 문자열.
 */
function getSortIcon(key) {
  if (sortColumn.value !== key) return 'mdi:sort'
  return sortOrder.value === 'asc' ? 'mdi:sort-ascending' : 'mdi:sort-descending'
}

/**
 * 테이블 헤더의 정렬 상태를 토글합니다.
 * 현재 정렬 컬럼과 일치하면 정렬 순서(오름차순/내림차순)를 변경하고,
 * 일치하지 않으면 해당 컬럼을 새로운 정렬 컬럼으로 설정하고 오름차순으로 초기화합니다.
 * 정렬 후 현재 페이지를 1로 초기화하고 데이터를 새로고침합니다.
 * @param {string} key - 정렬할 컬럼의 키.
 */
function toggleSort(key) {
  if (sortColumn.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = key
    sortOrder.value = 'asc'
  }
  currentPage.value = 1
  if (isMobile.value) { // Reset loaded posts on sort change for mobile infinite scroll
    resetPaginationAndLoadingState();
  }
  // fetchPosts() will be triggered by watchEffect
}

const initialLoading = ref(true)
const loadingMore = ref(false) // NEW: For infinite scroll loading state
const hasMorePosts = ref(true) // NEW: To track if there are more pages to load

//로그인한 유저이면서 role이 admin인 유저만 보도록 하기
const { user, isLoggedIn } = useAuth()
const { isMobile } = useIsMobile() // NEW: Mobile detection

const loadedPosts = ref([]) // NEW: This will accumulate all posts for infinite scroll

/**
 * 게시물 데이터를 비동기적으로 가져오는 함수입니다.
 * API 호출 중 로딩 상태를 설정하고, 에러 발생 시 `error` 상태를 업데이트합니다.
 * @param {boolean} append - 기존 게시물에 새 게시물을 추가할지 여부. (무한 스크롤 시 true)
 */
async function fetchPosts(append = false) {
  if (!append) { // If not appending, reset for new search/sort/page
    resetPaginationAndLoadingState();
  } else {
    loadingMore.value = true
  }

  if (!props.isAdminBoard || (props.isAdminBoard && isLoggedIn.value && user.value?.role === 'ADMIN')) {
    try {
      const response = await $fetch(props.apiEndpoint, {
        params: {
          page: currentPage.value,
          itemsPerPage: itemsPerPage.value,
          type: searchParams.value.type,
          text: searchParams.value.text,
          sortColumn: sortColumn.value,
          sortOrder: sortOrder.value
        }
      })

      totalItems.value = response.total
      const newPosts = response.posts.map(post => ({
        ...post,
        // createdAt: formatDate(post.createdAt)
      }))

      if (append) {
        loadedPosts.value = [...loadedPosts.value, ...newPosts]
      } else {
        loadedPosts.value = newPosts
      }

      if (loadedPosts.value.length >= totalItems.value) {
        hasMorePosts.value = false
      } else {
        hasMorePosts.value = true
      }

    } catch (err) {
      console.error('Failed to fetch posts:', err)
      // TODO: 사용자에게 에러 메시지 표시
    } finally {
      initialLoading.value = false
      loadingMore.value = false
    }
  } else {
    router.push('/')
    initialLoading.value = false
    loadingMore.value = false
  }
}

// Watch dependencies and refetch posts
watchEffect(() => {
  // Only trigger fetchPosts if not in an appending state for mobile infinite scroll
  // or if it's not mobile (pagination will trigger full refetch)
  if (!isMobile.value || (isMobile.value && !loadingMore.value && currentPage.value === 1)) {
    fetchPosts()
  }
})

/**
 * 검색 파라미터가 변경될 때 호출되는 핸들러 함수입니다.
 * 검색 파라미터를 업데이트하고 현재 페이지를 1로 초기화합니다.
 * @param {object} params - 새로운 검색 파라미터 (type, text 포함).
 */
function handleSearch(params) {
  searchParams.value = params
  // watchEffect will trigger fetchPosts due to searchParams change
}

/**
 * 페이지 변경 시 호출되는 핸들러 함수입니다.
 * 현재 페이지를 업데이트합니다.
 * @param {number} page - 새로 변경된 페이지 번호.
 */
async function handlePageChange(page) {
  if (!isMobile.value) { // Only for pagination (non-mobile)
    currentPage.value = page
    // watchEffect will trigger fetchPosts due to currentPage change
  }
}

/**
 * 페이지당 항목 수 변경 시 호출되는 핸들러 함수입니다.
 * 페이지당 항목 수를 업데이트하고 현재 페이지를 1로 초기화합니다.
 * @param {number} newItemsPerPage - 새로 변경된 페이지당 항목 수.
 */
async function handleItemsPerPageChange(newItemsPerPage) {
  if (!isMobile.value) { // Only for pagination (non-mobile)
    itemsPerPage.value = newItemsPerPage
    currentPage.value = 1
    // watchEffect will trigger fetchPosts due to itemsPerPage change
  }
}

/**
 * 무한 스크롤 시 다음 페이지의 게시물을 로드하는 함수입니다.
 */
async function loadMorePosts() {
  if (loadingMore.value || !hasMorePosts.value) return

  currentPage.value++ // Increment page for next fetch
  await fetchPosts(true) // Fetch and append to loadedPosts
}

// Expose loadedPosts to template
const posts = computed(() => loadedPosts.value)

const infiniteScrollSentinel = ref(null)
let observer

onMounted(() => {
  if (isMobile.value) {
    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMorePosts.value && !loadingMore.value) {
        loadMorePosts()
      }
    }, {
      rootMargin: '0px',
      threshold: 0.1
    })

    if (infiniteScrollSentinel.value) {
      observer.observe(infiniteScrollSentinel.value)
    }
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

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
  console.log('New header order:', localHeaders.value)
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