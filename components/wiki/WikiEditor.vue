<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 dark:text-white flex items-center">
      <Icon :icon="isEditing ? 'mdi:pencil' : 'mdi:plus'" class="mr-2" />
      {{ isEditing ? '위키 문서 수정' : '새 위키 문서 작성' }}
    </h1>
    <form @submit.prevent="submitWiki" class="space-y-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
          <Icon icon="mdi:format-title" class="mr-1" />
          제목 *
        </label>
        <input type="text" id="title" v-model="wiki.title" required
               placeholder="위키 문서 제목을 입력하세요"
               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
      </div>
      <div>
        <label for="content" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
          <Icon icon="mdi:text-box-outline" class="mr-1" />
          내용 *
        </label>
        <WikiQuillEditor
          :value="wiki.content"
          @input="updateField('content', $event)"
          placeholder="마크다운으로 내용을 입력하세요"
        />
      </div>
      <div class="flex justify-between">
        <!-- 임시저장 버튼과 문법 가이드 (왼쪽) -->
        <div class="flex space-x-4 items-center">
          <button 
            type="button" 
            @click="saveDraft" 
            :disabled="isDraftLoading"
            class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 flex items-center disabled:opacity-50"
          >
            <Icon :icon="isDraftLoading ? 'mdi:loading' : 'mdi:content-save-outline'" class="mr-2" :class="{ 'animate-spin': isDraftLoading }" />
            {{ isDraftLoading ? '저장 중...' : '임시저장' }}
          </button>
          <NuxtLink to="/wiki/syntax" class="text-blue-500 hover:text-blue-600 flex items-center">
            <Icon icon="mdi:help-circle-outline" class="mr-1" />
            마크 문법 가이드 보기
          </NuxtLink>
        </div>
        
        <!-- 기존 버튼들 (오른쪽) -->
        <div class="flex space-x-4">
          <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center">
            <Icon :icon="isEditing ? 'mdi:content-save' : 'mdi:send'" class="mr-2" />
            {{ isEditing ? '수정하기' : '작성하기' }}
          </button>
          <NuxtLink to="/wiki" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 flex items-center">
            <Icon icon="mdi:format-list-bulleted" class="mr-2" />
            목록
          </NuxtLink>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useModal } from '~/composables/useModal'
import { Icon } from '@iconify/vue'
import WikiQuillEditor from '~/components/wiki/WikiQuillEditor.vue'
import { useDraftSave } from '~/composables/useDraftSave'

const props = defineProps({
  apiEndpoint: {
    type: String,
    required: true
  },
  fields: {
    type: Array,
    default: () => [
      { name: 'title', required: true },
      { name: 'content', required: true }
    ]
  }
})

const route = useRoute()
const router = useRouter()
const { openModal } = useModal()

const isEditing = ref(false)
const wiki = ref({ title: '', content: '' })

// 임시저장 기능 추가
const {
  isDraftLoading,
  saveDraft,
  showDraftRestorePrompt,
  onFormSubmitSuccess,
  cleanupExpiredDrafts
} = useDraftSave('wiki', wiki, props.fields)

/**
 * 위키 문서를 제출하는 함수입니다.
 */
const submitWiki = async () => {
  try {
    const url = isEditing.value ? `${props.apiEndpoint}/${route.query.slug}` : props.apiEndpoint
    const method = isEditing.value ? 'PUT' : 'POST'
    
    const { data, error } = await $fetch(url, {
      method,
      body: wiki.value
    })
    
    if (error) {
      openModal('오류', isEditing.value ? '위키 수정에 실패했습니다.' : '위키 작성에 실패했습니다.')
      return
    }
    
    // 제출 성공 시 초안 삭제
    onFormSubmitSuccess()
    
    openModal('성공', isEditing.value ? '위키가 성공적으로 수정되었습니다.' : '위키가 성공적으로 작성되었습니다.')
    router.push('/wiki')
  } catch (error) {
    console.error('위키 제출 오류:', error)
    openModal('오류', isEditing.value ? '위키 수정에 실패했습니다.' : '위키 작성에 실패했습니다.')
  }
}

/**
 * 컴포넌트 마운트 시 기존 위키 데이터를 불러옵니다.
 */
onMounted(async () => {
  // 만료된 초안들 정리
  cleanupExpiredDrafts()

  if (route.query.slug) {
    isEditing.value = true
    try {
      const { data } = await useFetch(`${props.apiEndpoint}/${route.query.slug}`)
      if (data.value) {
        wiki.value = data.value
      } else {
        openModal('오류', '위키 문서를 불러오는데 실패했습니다.')
      }
    } catch (e) {
      openModal('오류', '위키 문서를 불러오는데 실패했습니다.')
    }
  } else {
    // 새 문서 작성 시에만 초안 복구 프롬프트 표시
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
  wiki.value[fieldName] = event.target ? event.target.value : event
  //console.log(`Field ${fieldName} updated:`, wiki.value[fieldName])
}
</script>