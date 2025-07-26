import { ref, computed, watchEffect, onMounted, onUnmounted } from 'vue'
import { useIsMobile } from '~/composables/useIsMobile'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'

// 범용 목록 데이터 관리 컴포저블
export function useListData(apiEndpoint, options = {}) {
  const {
    enableInfiniteScroll = true,
    enableSearch = true,
    enableSort = true,
    isAdminBoard = false,
    itemsPerPage: defaultItemsPerPage = 10,
    contentType = 'posts'
  } = options

  const router = useRouter()
  const { isMobile } = useIsMobile()
  const { user, isLoggedIn } = useAuth()

  // 상태 관리
  const posts = ref([])
  const loadedPosts = ref([])
  const totalItems = ref(0)
  const itemsPerPage = ref(defaultItemsPerPage)
  const currentPage = ref(1)
  const initialLoading = ref(true)
  const loadingMore = ref(false)
  const hasMorePosts = ref(true)
  const error = ref(null)
  const searchParams = ref({ type: 'title', text: '' })
  const sortColumn = ref('')
  const sortOrder = ref('asc')
  const infiniteScrollSentinel = ref(null)
  let observer = null

  const resetPaginationAndLoadingState = () => {
    initialLoading.value = true
    loadedPosts.value = []
    currentPage.value = 1
    hasMorePosts.value = true
    error.value = null
  }

  const getSortIcon = (key) => 
    sortColumn.value !== key ? 'mdi:sort' : 
    sortOrder.value === 'asc' ? 'mdi:sort-ascending' : 'mdi:sort-descending'

  const toggleSort = (key) => {
    if (!enableSort) return
    
    if (sortColumn.value === key) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortColumn.value = key
      sortOrder.value = 'asc'
    }
    currentPage.value = 1
    if (isMobile.value) resetPaginationAndLoadingState()
  }

  const fetchPosts = async (append = false) => {
    if (!append) {
      resetPaginationAndLoadingState()
    } else {
      loadingMore.value = true
    }

    if (isAdminBoard && (!isLoggedIn.value || user.value?.role !== 'ADMIN')) {
      router.push('/')
      initialLoading.value = false
      loadingMore.value = false
      return
    }

    try {
      const response = await $fetch(apiEndpoint, {
        params: {
          page: currentPage.value,
          itemsPerPage: itemsPerPage.value,
          type: searchParams.value.type,
          text: searchParams.value.text,
          sortColumn: sortColumn.value,
          sortOrder: sortOrder.value
        }
      })

      // API 응답이 배열인 경우와 객체인 경우 모두 처리
      if (Array.isArray(response)) {
        // 단순 배열 응답인 경우 (예: /api/blogPosts)
        totalItems.value = response.length
        const newPosts = response
        loadedPosts.value = append ? [...loadedPosts.value, ...newPosts] : newPosts
        hasMorePosts.value = false // 단순 배열인 경우 페이지네이션 없음
      } else {
        // 페이지네이션 객체 응답인 경우
        totalItems.value = response.total
        const newPosts = response[contentType] || response.posts || []
        loadedPosts.value = append ? [...loadedPosts.value, ...newPosts] : newPosts
        hasMorePosts.value = loadedPosts.value.length < totalItems.value
      }

    } catch (err) {
      console.error('Failed to fetch posts:', err)
      error.value = err.message || '데이터를 불러오는 중 오류가 발생했습니다.'
    } finally {
      initialLoading.value = false
      loadingMore.value = false
    }
  }

  const handleSearch = (params) => {
    if (!enableSearch) return
    searchParams.value = params
    currentPage.value = 1
    if (isMobile.value) resetPaginationAndLoadingState()
  }

  const handlePageChange = (page) => {
    if (!isMobile.value) currentPage.value = page
  }

  const handleItemsPerPageChange = (newItemsPerPage) => {
    if (!isMobile.value) {
      itemsPerPage.value = newItemsPerPage
      currentPage.value = 1
    }
  }

  const loadMorePosts = async () => {
    if (loadingMore.value || !hasMorePosts.value || !enableInfiniteScroll) return
    currentPage.value++
    await fetchPosts(true)
  }

  const setupInfiniteScroll = () => {
    if (!enableInfiniteScroll || !isMobile.value) return

    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMorePosts.value && !loadingMore.value) {
        loadMorePosts()
      }
    }, { rootMargin: '0px', threshold: 0.1 })

    if (infiniteScrollSentinel.value) {
      observer.observe(infiniteScrollSentinel.value)
    }
  }

  const cleanupInfiniteScroll = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  // 데이터 변경 감지 및 자동 페칭
  watchEffect(() => {
    if (!isMobile.value || (isMobile.value && !loadingMore.value && currentPage.value === 1)) {
      fetchPosts()
    }
  })

  onMounted(setupInfiniteScroll)
  onUnmounted(cleanupInfiniteScroll)

  return {
    posts: computed(() => loadedPosts.value),
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
    getSortIcon,
    toggleSort,
    handleSearch,
    handlePageChange,
    handleItemsPerPageChange,
    loadMorePosts,
    infiniteScrollSentinel,
    isMobile
  }
} 