import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

/**
 * 게시글 상세 데이터와 이전/다음 글 정보를 관리하는 컴포저블입니다.
 * @param {string} apiEndpoint - 게시글 API 엔드포인트 URL.
 * @param {object} postIdRef - 현재 게시글의 ID를 담고 있는 ref.
 */
export function useBoardPostDetail(apiEndpoint, postIdRef) {
  const post = ref(null)
  const error = ref(null)
  const pending = ref(false)
  const prevPost = ref(null)
  const nextPost = ref(null)

  /**
   * 게시글 데이터와 이전/다음 글 정보를 비동기적으로 가져옵니다.
   * API 호출 중 로딩 상태를 'pending'으로, 에러 발생 시 'error' 상태를 업데이트합니다.
   */
  async function fetchPostData() {
    pending.value = true
    error.value = null
    try {
      const [postResponse, navigationResponse] = await Promise.all([
        $fetch(apiEndpoint.value, {
          method: 'GET',
          query: { id: postIdRef.value }
        }),
        $fetch(apiEndpoint.value, {
          method: 'GET',
          query: { id: postIdRef.value, type: 'navigation' }
        }).catch(() => ({ prev: null, next: null })) // navigation API가 없을 경우 에러 방지
      ])

      post.value = postResponse
      prevPost.value = navigationResponse?.prev || null
      nextPost.value = navigationResponse?.next || null
    } catch (e) {
      error.value = e.message || '데이터를 불러오는데 실패했습니다.'
      console.error('Fetch error:', e)
    } finally {
      pending.value = false
    }
  }

  // postIdRef가 변경될 때마다 fetchData 함수를 호출합니다.
  watch(postIdRef, (newId) => {
    if (newId) {
      fetchPostData()
    }
  }, { immediate: true })

  return {
    post,
    error,
    pending,
    prevPost,
    nextPost,
    fetchPostData
  }
} 