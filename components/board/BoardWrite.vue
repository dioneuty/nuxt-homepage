<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 dark:text-white flex items-center">
      <Icon :icon="isEditing ? 'mdi:pencil' : 'mdi:pencil-plus'" class="mr-2" />
      {{ isEditing ? '게시글 수정' : '새 게시글 작성' }}
    </h1>
    <form @submit.prevent="submitPost" class="space-y-4">
      <div v-for="field in fields" :key="field.name">
        <label :for="field.name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
          <Icon :icon="field.icon" class="mr-1" />
          {{ field.label }} {{ field.required ? '*' : '' }}
        </label>
        <CommonQuillEditor
          v-if="field.component === 'CommonQuillEditor'"
          :value="post[field.name]"
          @input="updateField(field.name, $event)"
        :placeholder="field.placeholder"
        />
        <component
          v-else
          :is="field.component" 
          :id="field.name" 
          :value="post[field.name]"
          @input="updateField(field.name, $event)"
          class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" 
          :placeholder="field.placeholder"
          :required="field.required"
        />
      </div>
      <div class="flex justify-between">
        <!-- 임시저장 버튼 (왼쪽) -->
        <button 
          type="button" 
          @click="saveDraft" 
          :disabled="isDraftLoading"
          class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 flex items-center disabled:opacity-50"
        >
          <Icon :icon="isDraftLoading ? 'mdi:loading' : 'mdi:content-save-outline'" class="mr-2" :class="{ 'animate-spin': isDraftLoading }" />
          {{ isDraftLoading ? '저장 중...' : '임시저장' }}
        </button>

        <!-- 기존 버튼들 (오른쪽) -->
        <div class="flex space-x-4">
          <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center">
            <Icon :icon="isEditing ? 'mdi:content-save' : 'mdi:send'" class="mr-2" />
            {{ isEditing ? '수정하기' : '작성하기' }}
          </button>
          <button v-if="isEditing" @click="cancelEdit" type="button" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 flex items-center">
            <Icon icon="mdi:cancel" class="mr-2" />
            취소
          </button>
          <NuxtLink :to="listPath" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 flex items-center">
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
import { useFormSubmit } from '~/composables/useFormSubmit'
import { useDraftSave } from '~/composables/useDraftSave'

// 🚀 에디터 지연 로딩
const CommonQuillEditor = defineAsyncComponent(() => import('~/components/CommonQuillEditor.vue'))

const props = defineProps({
  apiEndpoint: { // 게시글 데이터 엔드포인트
    type: String,
    required: true
  },
  fields: { // 게시글 필드 목록
    type: Array,
    required: true
  },
  listPath: { // 게시글 목록 경로
    type: String,
    required: true
  }
})
  
const route = useRoute() // 현재 라우트 정보
const router = useRouter() // 라우터 인스턴스
const { openModal } = useModal() // 모달 관련 함수
  
const isEditing = ref(false) // 게시글 수정 여부
const post = ref({}) // 게시글 데이터
  
const { submitForm: originalSubmitForm } = useFormSubmit(
  post,
  props.apiEndpoint,
  props.listPath,
  isEditing,
  computed(() => route.query.id),
  props.fields,
  '게시글이 성공적으로 작성되었습니다.',
  '게시글이 성공적으로 수정되었습니다.',
  '게시글 작성에 실패했습니다.',
  '게시글 수정에 실패했습니다.'
)

// 임시저장 기능 추가
const {
  isDraftLoading,
  saveDraft,
  showDraftRestorePrompt,
  onFormSubmitSuccess,
  cleanupExpiredDrafts
} = useDraftSave('board', post, props.fields)

// 폼 제출 시 초안 삭제를 포함한 래핑된 함수
const submitPost = async () => {
  try {
    await originalSubmitForm()
    // 제출 성공 시 초안 삭제
    onFormSubmitSuccess()
  } catch (error) {
    // 제출 실패 시에는 초안을 보존
    throw error
  }
}

onMounted(async () => {
  // 만료된 초안들 정리
  cleanupExpiredDrafts()

  // 게시글 필드 초기화
  props.fields.forEach(field => {
    post.value[field.name] = ''
  })
  
  // 게시글 수정 여부 확인
  if (route.query.id) {
    isEditing.value = true
    const { data, error } = await useFetch(`${props.apiEndpoint}?id=${route.query.id}`)
    // 게시글 데이터 가져오기
    if (error.value) {
      openModal('오류', '게시글을 불러오는데 실패했습니다.')
      return
    }
    // 게시글 데이터 설정
    post.value = data.value
  } else {
    // 새 글 작성 시에만 초안 복구 프롬프트 표시
    nextTick(() => {
      showDraftRestorePrompt()
    })
  }
})
  
/**
 * 폼 필드의 값을 업데이트하는 함수입니다.
 * Quill 에디터와 같은 커스텀 컴포넌트의 입력 이벤트를 처리할 수 있도록 일반화되었습니다.
 * @param {string} fieldName - 업데이트할 필드의 이름.
 * @param {Event|string} event - 입력 이벤트 객체 또는 직접적인 값.
 */
function updateField(fieldName, event) {
  // 폼 필드의 값을 업데이트
  post.value[fieldName] = event.target ? event.target.value : event
  //console.log(`Field ${fieldName} updated:`, post.value[fieldName])
}

/**
 * 게시글 수정을 취소하고 게시글 상세 페이지로 돌아가는 함수입니다.
 */
function cancelEdit() {
  router.push(`${props.listPath}/view?id=${route.query.id}`)
}
</script>