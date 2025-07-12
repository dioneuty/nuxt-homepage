import { ref, watchEffect, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useIsMobile } from '~/composables/useIsMobile'

// 게시물 목록 및 페이지네이션/정렬/검색 관련 로직 관리 컴포저블
export function useBoardPosts(props) {
  const router = useRouter()
  const { user, isLoggedIn } = useAuth()
  const { isMobile } = useIsMobile()

  const totalItems = ref(0)
  const itemsPerPage = ref(10)
  const currentPage = ref(1)
  const searchParams = ref({ type: 'title', text: '' })
  const sortColumn = ref('')
  const sortOrder = ref('asc')
  const initialLoading = ref(true)
  const loadingMore = ref(false)
  const hasMorePosts = ref(true)
  const loadedPosts = ref([])
  const infiniteScrollSentinel = ref(null)
  let observer

  const resetPaginationAndLoadingState = () => {
    initialLoading.value = true
    loadedPosts.value = []
    currentPage.value = 1
    hasMorePosts.value = true
  }

  const getSortIcon = (key) => 
    sortColumn.value !== key ? 'mdi:sort' :
    sortOrder.value === 'asc' ? 'mdi:sort-ascending' : 'mdi:sort-descending'

  const toggleSort = (key) => {
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

    if (props.isAdminBoard && (!isLoggedIn.value || user.value?.role !== 'ADMIN')) {
      router.push('/')
      initialLoading.value = false
      loadingMore.value = false
      return
    }

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
      const newPosts = response.posts

      loadedPosts.value = append ? [...loadedPosts.value, ...newPosts] : newPosts
      hasMorePosts.value = loadedPosts.value.length < totalItems.value

    } catch (err) {
      console.error('Failed to fetch posts:', err)
    } finally {
      initialLoading.value = false
      loadingMore.value = false
    }
  }

  const handleSearch = (params) => {
    searchParams.value = params
  }

  const handlePageChange = async (page) => {
    if (!isMobile.value) currentPage.value = page
  }

  const handleItemsPerPageChange = async (newItemsPerPage) => {
    if (!isMobile.value) {
      itemsPerPage.value = newItemsPerPage
      currentPage.value = 1
    }
  }

  const loadMorePosts = async () => {
    if (loadingMore.value || !hasMorePosts.value) return
    currentPage.value++
    await fetchPosts(true)
  }

  // Watch dependencies and refetch posts
  watchEffect(() => {
    if (!isMobile.value || (isMobile.value && !loadingMore.value && currentPage.value === 1)) {
      fetchPosts()
    }
  })

  onMounted(() => {
    if (isMobile.value) {
      observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMorePosts.value && !loadingMore.value) {
          loadMorePosts()
        }
      }, { rootMargin: '0px', threshold: 0.1 })

      if (infiniteScrollSentinel.value) {
        observer.observe(infiniteScrollSentinel.value)
      }
    }
  })

  onUnmounted(() => {
    if (observer) observer.disconnect()
  })

  return {
    totalItems,
    itemsPerPage,
    currentPage,
    searchParams,
    sortColumn,
    sortOrder,
    initialLoading,
    loadingMore,
    hasMorePosts,
    loadedPosts: computed(() => loadedPosts.value),
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