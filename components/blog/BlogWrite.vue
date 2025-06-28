<template>
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6 dark:text-white flex items-center">
        <Icon :icon="isEditing ? 'mdi:pencil' : 'mdi:pencil-plus'" class="mr-2" />
        {{ isEditing ? '블로그 글 수정' : '새 블로그 글 작성' }}
      </h1>
      <form @submit.prevent="submitPost" class="space-y-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
          <Icon icon="mdi:format-title" class="mr-1" />
          제목 *
        </label>
        <input type="text" id="title" v-model="post.title" required
               placeholder="제목을 입력하세요"
               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
      </div>
      <div>
        <label for="categoryId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
          <Icon icon="mdi:folder-outline" class="mr-1" />
          카테고리 *
        </label>
        <select id="categoryId" v-model="post.categoryId" required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          <option value="" disabled selected>카테고리를 선택하세요</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }} ({{ category.post_count }})
          </option>
        </select>
      </div>
      <div>
        <label for="content" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
          <Icon icon="mdi:text-box-outline" class="mr-1" />
          내용 *
        </label>
        <CommonQuillEditor
          :value="post.content"
          @input="updateField('content', $event)"
          placeholder="내용을 입력하세요"
        />
      </div>
      <div class="flex justify-between">
        <!-- 임시저장 버튼 (왼쪽) -->
        <button 
          type="button" 
          @click="saveDraft" 
          :disabled="isDraftLoading"
          class="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors duration-200 flex items-center disabled:opacity-50"
        >
          <Icon :icon="isDraftLoading ? 'mdi:loading' : 'mdi:content-save-outline'" class="mr-2" :class="{ 'animate-spin': isDraftLoading }" />
          {{ isDraftLoading ? '저장 중...' : '임시저장' }}
        </button>
        
        <!-- 기존 버튼들 (오른쪽) -->
        <div class="flex space-x-4">
          <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center">
            <Icon :icon="isEditing ? 'mdi:content-save' : 'mdi:send'" class="mr-2" />
            {{ isEditing ? '수정' : '작성' }}
          </button>
          <button v-if="isEditing" @click="cancelEdit" type="button" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center">
            <Icon icon="mdi:cancel" class="mr-2" />
            취소
          </button>
          <NuxtLink :to="props.listPath" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-200 flex items-center">
            <Icon icon="mdi:format-list-bulleted" class="mr-2" />
            목록
          </NuxtLink>
        </div>
      </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed, defineAsyncComponent, nextTick } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useModal } from '~/composables/useModal'
import { Icon } from '@iconify/vue'
import { useBlogSubmit } from '~/composables/useBlogSubmit'
import { useDraftSave } from '~/composables/useDraftSave'

// 🚀 에디터 지연 로딩
const CommonQuillEditor = defineAsyncComponent(() => import('~/components/CommonQuillEditor.vue'))
  
  const props = defineProps({
    apiEndpoint: {
      type: String,
      required: true
    },
    listPath: {
      type: String,
      required: true
    },
    fields: {
      type: Array,
      default: () => [
        { name: 'title', required: true },
        { name: 'categoryId', required: true },
        { name: 'content', required: true },
      ]
    }
  })
  
  const route = useRoute()
  const router = useRouter()
  const { openModal } = useModal()
  
  const isEditing = ref(false)
  const post = ref({})
  const pending = ref(false)
  const error = ref(null)
  const categories = ref([])

  const { submitPost: originalSubmitPost } = useBlogSubmit(
    post,
    props.apiEndpoint,
    props.listPath,
    isEditing,
    computed(() => route.query.id),
    props.fields
  )

  // 임시저장 기능 추가
  const {
    isDraftLoading,
    saveDraft,
    showDraftRestorePrompt,
    onFormSubmitSuccess,
    cleanupExpiredDrafts
  } = useDraftSave('blog', post, props.fields)

  // 폼 제출 시 초안 삭제를 포함한 래핑된 함수
  const submitPost = async () => {
    try {
      await originalSubmitPost()
      // 제출 성공 시 초안 삭제
      onFormSubmitSuccess()
    } catch (error) {
      // 제출 실패 시에는 초안을 보존
      throw error
    }
  }

  /**
   * 컴포넌트 마운트 시 카테고리 목록을 불러오고,
   * URL 쿼리에 `id`가 있다면 기존 블로그 게시글 데이터를 불러와 수정 모드로 설정합니다.
   * API 호출 중 로딩 및 에러 상태를 처리하고, 모달을 통해 사용자에게 피드백을 제공합니다.
   */
  onMounted(async () => {
    try {
      // 만료된 초안들 정리
      cleanupExpiredDrafts()
      
      // post 객체 초기화 (필드가 존재하도록)
      props.fields.forEach(field => {
        if (!post.value[field.name]) {
          post.value[field.name] = ''
        }
      })
      
      const { data: categoriesData } = await useFetch('/api/categories')
      categories.value = categoriesData.value.filter(category => category.id !== 'all')

      if (route.query.id) {
        isEditing.value = true
        pending.value = true
        try {
          const { data } = await useFetch(`${props.apiEndpoint}?id=${route.query.id}`)
          if (data.value) {
            post.value = data.value
          } else {
            openModal('오류', '블로그 글을 불러오는데 실패했습니다.')
          }
        } catch (e) {
          error.value = e
          openModal('오류', '블로그 글을 불러오는데 실패했습니다.')
        } finally {
          pending.value = false
        }
      } else {
        // 새 글 작성 시에만 초안 복구 프롬프트 표시
        // 카테고리 로딩 완료 후 초안 복원 시도
        await nextTick()
        setTimeout(() => {
          showDraftRestorePrompt()
        }, 100) // 약간의 지연을 줘서 모든 초기화가 완료된 후 실행
      }
    } catch (e) {
      error.value = e
      openModal('오류', '카테고리 목록을 불러오는데 실패했습니다.')
    }
  })
  
  /**
   * 폼 필드의 값을 업데이트하는 함수입니다.
   * Quill 에디터와 같은 커스텀 컴포넌트의 입력 이벤트를 처리할 수 있도록 일반화되었습니다.
   * @param {string} fieldName - 업데이트할 필드의 이름.
   * @param {Event|string} event - 입력 이벤트 객체 또는 직접적인 값.
   */
  function updateField(fieldName, event) {
    post.value[fieldName] = event.target ? event.target.value : event
    //console.log(`Field ${fieldName} updated:`, post.value[fieldName])
  }
  
  /**
   * 블로그 글 수정을 취소하고 게시글 상세 페이지로 돌아가는 함수입니다.
   */
  function cancelEdit() {
    router.push(`${props.listPath}/view?id=${route.query.id}`)
  }
  </script>