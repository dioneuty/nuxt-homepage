import { ref, watch, computed } from 'vue'

/**
 * 블로그 게시글 데이터 및 이전/다음 글 정보를 관리하는 컴포저블입니다.
 * @param {object} apiEndpoint - 블로그 API 엔드포인트 URL을 담고 있는 ref.
 * @param {object} postIdRef - 현재 게시글의 ID를 담고 있는 ref.
 * @returns {object} 게시물 데이터와 관련 상태 및 함수들.
 */
export function useBlogPosts(apiEndpoint, postIdRef) {
  const post = ref(null)
  const pending = ref(true) // 초기 로딩 상태를 true로 설정
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
        }).catch(() => ({ prev: null, next: null })) // navigation API가 없을 경우 에러 방지
      ])
    },
    {
      watch: [postIdRef, apiEndpoint], // postIdRef 또는 apiEndpoint가 변경될 때마다 데이터 다시 가져오기
      immediate: true, // 컴포저블이 처음 호출될 때 즉시 실행
      transform: ([postResponse, navigationResponse]) => {
        post.value = postResponse
        prevPost.value = navigationResponse?.prev || null
        nextPost.value = navigationResponse?.next || null
        return postResponse // useAsyncData의 data로 메인 게시물 데이터 반환
      },
      onSuccess: (response) => {
        pending.value = false;
      },
      onError: (e) => {
        error.value = e.message || '데이터를 불러오는데 실패했습니다.'
        pending.value = false
      }
    }
  )

  // useAsyncData의 pending 및 error 상태를 로컬 pending/error ref에 동기화
  watch(fetchPending, (newVal) => { pending.value = newVal }, { immediate: true })
  watch(fetchError, (newVal) => { 
    error.value = newVal?.message || null;
  }, { immediate: true })

  return {
    post,
    pending,
    error,
    prevPost,
    nextPost,
  }
} 