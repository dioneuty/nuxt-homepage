import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

// 게시글 상세 데이터와 이전/다음 글 정보 관리 컴포저블
export function useBoardPostDetail(apiEndpoint, postIdRef) {
  const post = ref(null)
  const error = ref(null)
  const pending = ref(false)
  const prevPost = ref(null)
  const nextPost = ref(null)

  const fetchPostData = async () => {
    pending.value = true
    error.value = null
    try {
      const [postResponse, navigationResponse] = await Promise.all([
        $fetch(apiEndpoint.value, { method: 'GET', query: { id: postIdRef.value } }),
        $fetch(apiEndpoint.value, { 
          method: 'GET', 
          query: { id: postIdRef.value, type: 'navigation' } 
        }).catch(() => ({ prev: null, next: null }))
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

  watch(postIdRef, (newId) => {
    if (newId) fetchPostData()
  }, { immediate: true })

  return { post, error, pending, prevPost, nextPost, fetchPostData }
} 