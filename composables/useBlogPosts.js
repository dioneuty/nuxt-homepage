import { ref, watch, computed } from 'vue'

// 블로그 게시글 데이터 및 이전/다음 글 정보 관리 컴포저블
export function useBlogPosts(apiEndpoint, postIdRef) {
  const post = ref(null)
  const pending = ref(true)
  const error = ref(null)
  const prevPost = ref(null)
  const nextPost = ref(null)

  const { data, pending: fetchPending, error: fetchError } = useAsyncData(
    () => {
      return Promise.all([
        $fetch(apiEndpoint.value, {
          method: 'GET',
          query: { id: postIdRef.value }
        }),
        $fetch(apiEndpoint.value, {
          method: 'GET',
          query: { id: postIdRef.value, type: 'navigation' }
        }).catch(() => ({ prev: null, next: null }))
      ])
    },
    {
      watch: [postIdRef, apiEndpoint],
      immediate: true,
      transform: ([postResponse, navigationResponse]) => {
        post.value = postResponse
        prevPost.value = navigationResponse?.prev || null
        nextPost.value = navigationResponse?.next || null
        return postResponse
      },
      onSuccess: () => { pending.value = false },
      onError: (e) => {
        error.value = e.message || '데이터를 불러오는데 실패했습니다.'
        pending.value = false
      }
    }
  )

  watch(fetchPending, (newVal) => { pending.value = newVal }, { immediate: true })
  watch(fetchError, (newVal) => { error.value = newVal?.message || null }, { immediate: true })

  return { post, pending, error, prevPost, nextPost }
} 