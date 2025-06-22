import { ref, watchEffect, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useIsMobile } from '~/composables/useIsMobile'

/**
 * 게시물 목록 및 페이지네이션/정렬/검색 관련 로직을 관리하는 컴포저블입니다.
 * @param {object} props - BoardIndex.vue에서 필요한 props 객체 (apiEndpoint, isAdminBoard 등).
 * @returns {object} 게시물 데이터와 관련 상태 및 함수들.
 */
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

  /**
   * 주어진 키(key)에 해당하는 정렬 아이콘을 반환합니다.
   * 현재 정렬 컬럼과 일치하지 않으면 일반 정렬 아이콘을, 일치하면 오름차순 또는 내림차순 아이콘을 반환합니다.
   * @param {string} key - 헤더의 키.
   * @returns {string} Iconify 아이콘 문자열.
   */
  const getSortIcon = (key) => {
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
    if (isMobile.value) {
      resetPaginationAndLoadingState();
    }
  }

  /**
   * 게시물 데이터를 비동기적으로 가져오는 함수입니다.
   * API 호출 중 로딩 상태를 설정하고, 에러 발생 시 `error` 상태를 업데이트합니다.
   * @param {boolean} append - 기존 게시물에 새 게시물을 추가할지 여부. (무한 스크롤 시 true)
   */
  async function fetchPosts(append = false) {
    if (!append) {
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
  }

  /**
   * 페이지 변경 시 호출되는 핸들러 함수입니다.
   * 현재 페이지를 업데이트합니다.
   * @param {number} page - 새로 변경된 페이지 번호.
   */
  async function handlePageChange(page) {
    if (!isMobile.value) {
      currentPage.value = page
    }
  }

  /**
   * 페이지당 항목 수 변경 시 호출되는 핸들러 함수입니다.
   * 페이지당 항목 수를 업데이트하고 현재 페이지를 1로 초기화합니다.
   * @param {number} newItemsPerPage - 새로 변경된 페이지당 항목 수.
   */
  async function handleItemsPerPageChange(newItemsPerPage) {
    if (!isMobile.value) {
      itemsPerPage.value = newItemsPerPage
      currentPage.value = 1
    }
  }

  /**
   * 무한 스크롤 시 다음 페이지의 게시물을 로드하는 함수입니다.
   */
  async function loadMorePosts() {
    if (loadingMore.value || !hasMorePosts.value) return
    currentPage.value++
    await fetchPosts(true)
  }

  // IntersectionObserver for infinite scroll on mobile
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
    loadedPosts: computed(() => loadedPosts.value), // Expose loadedPosts as computed
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