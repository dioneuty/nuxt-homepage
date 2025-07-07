import { ref, computed, watchEffect, onMounted, onUnmounted } from 'vue'
import { useIsMobile } from '~/composables/useIsMobile'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'

/**
 * 범용 목록 데이터 관리 컴포저블 함수입니다.
 * 무한스크롤, 페이지네이션, 검색, 정렬 기능을 통합하여 제공합니다.
 * 모바일에서는 무한스크롤, 데스크톱에서는 페이지네이션을 사용합니다.
 * 
 * @param {string} apiEndpoint - 데이터를 가져올 API 엔드포인트
 * @param {Object} options - 설정 옵션
 * @param {boolean} options.enableInfiniteScroll - 무한스크롤 활성화 여부 (기본: true)
 * @param {boolean} options.enableSearch - 검색 기능 활성화 여부 (기본: true)
 * @param {boolean} options.enableSort - 정렬 기능 활성화 여부 (기본: true)
 * @param {boolean} options.isAdminBoard - 관리자 전용 게시판 여부 (기본: false)
 * @param {number} options.itemsPerPage - 페이지당 항목 수 (기본: 10)
 * @param {string} options.contentType - 컨텐츠 타입 (기본: 'posts')
 * @returns {Object} 목록 데이터 관련 상태 및 함수들
 */
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

  // 검색 및 정렬 상태
  const searchParams = ref({ type: 'title', text: '' })
  const sortColumn = ref('')
  const sortOrder = ref('asc')

  // 무한스크롤 관련
  const infiniteScrollSentinel = ref(null)
  let observer = null

  /**
   * 게시물 목록 및 페이지네이션 관련 상태를 초기화합니다.
   */
  function resetPaginationAndLoadingState() {
    initialLoading.value = true
    loadedPosts.value = []
    currentPage.value = 1
    hasMorePosts.value = true
    error.value = null
  }

  /**
   * 주어진 키에 해당하는 정렬 아이콘을 반환합니다.
   * @param {string} key - 헤더의 키
   * @returns {string} Iconify 아이콘 문자열
   */
  function getSortIcon(key) {
    if (sortColumn.value !== key) return 'mdi:sort'
    return sortOrder.value === 'asc' ? 'mdi:sort-ascending' : 'mdi:sort-descending'
  }

  /**
   * 테이블 헤더의 정렬 상태를 토글합니다.
   * @param {string} key - 정렬할 컬럼의 키
   */
  function toggleSort(key) {
    if (!enableSort) return
    
    if (sortColumn.value === key) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortColumn.value = key
      sortOrder.value = 'asc'
    }
    currentPage.value = 1
    if (isMobile.value) {
      resetPaginationAndLoadingState()
    }
  }

  /**
   * 게시물 데이터를 비동기적으로 가져오는 함수입니다.
   * @param {boolean} append - 기존 게시물에 새 게시물을 추가할지 여부
   */
  async function fetchPosts(append = false) {
    if (!append) {
      resetPaginationAndLoadingState()
    } else {
      loadingMore.value = true
    }

    // 관리자 권한 체크
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

      totalItems.value = response.total
      const newPosts = response[contentType] || response.posts || []

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
      error.value = err.message || '데이터를 불러오는 중 오류가 발생했습니다.'
    } finally {
      initialLoading.value = false
      loadingMore.value = false
    }
  }

  /**
   * 검색 파라미터가 변경될 때 호출되는 핸들러 함수입니다.
   * @param {object} params - 새로운 검색 파라미터
   */
  function handleSearch(params) {
    if (!enableSearch) return
    searchParams.value = params
    currentPage.value = 1
    if (isMobile.value) {
      resetPaginationAndLoadingState()
    }
  }

  /**
   * 페이지 변경 시 호출되는 핸들러 함수입니다.
   * @param {number} page - 새로 변경된 페이지 번호
   */
  function handlePageChange(page) {
    if (!isMobile.value) {
      currentPage.value = page
    }
  }

  /**
   * 페이지당 항목 수 변경 시 호출되는 핸들러 함수입니다.
   * @param {number} newItemsPerPage - 새로 변경된 페이지당 항목 수
   */
  function handleItemsPerPageChange(newItemsPerPage) {
    if (!isMobile.value) {
      itemsPerPage.value = newItemsPerPage
      currentPage.value = 1
    }
  }

  /**
   * 무한 스크롤 시 다음 페이지의 게시물을 로드하는 함수입니다.
   */
  async function loadMorePosts() {
    if (loadingMore.value || !hasMorePosts.value || !enableInfiniteScroll) return

    currentPage.value++
    await fetchPosts(true)
  }

  /**
   * 무한스크롤 옵저버를 설정합니다.
   */
  function setupInfiniteScroll() {
    if (!enableInfiniteScroll || !isMobile.value) return

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

  /**
   * 무한스크롤 옵저버를 해제합니다.
   */
  function cleanupInfiniteScroll() {
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

  // 컴포넌트 마운트 시 무한스크롤 설정
  onMounted(() => {
    setupInfiniteScroll()
  })

  // 컴포넌트 언마운트 시 옵저버 해제
  onUnmounted(() => {
    cleanupInfiniteScroll()
  })

  return {
    // 데이터 상태
    posts: computed(() => loadedPosts.value),
    totalItems,
    itemsPerPage,
    currentPage,
    
    // 로딩 상태
    initialLoading,
    loadingMore,
    hasMorePosts,
    error,
    pending: computed(() => initialLoading.value),

    // 검색 및 정렬
    searchParams,
    sortColumn,
    sortOrder,
    handleSearch,
    toggleSort,
    getSortIcon,

    // 페이지네이션
    handlePageChange,
    handleItemsPerPageChange,

    // 무한스크롤
    loadMorePosts,
    infiniteScrollSentinel,

    // 유틸리티
    resetPaginationAndLoadingState,
    fetchPosts,
    
    // 상태 체크
    isMobile,
    isAdminBoard,
    enableInfiniteScroll,
    enableSearch,
    enableSort
  }
} 