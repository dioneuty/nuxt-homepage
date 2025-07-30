<template>
  <div class="wiki-editor-container">
    <h1 class="page-title-flex">
      <Icon :icon="isEditing ? 'mdi:pencil' : 'mdi:plus'" class="icon-mr-2" />
      {{ isEditing ? '위키 문서 수정' : '새 위키 문서 작성' }}
    </h1>
    <form @submit.prevent="submitWiki" class="wiki-editor-form">
      <div>
        <label for="title" class="form-label-flex">
          <Icon icon="mdi:format-title" class="icon-mr-1" />
          제목 *
        </label>
        <input type="text" id="title" v-model="wiki.title" required
               placeholder="위키 문서 제목을 입력하세요"
               class="input mt-1">
      </div>
      <div>
        <label for="content" class="form-label-flex">
          <Icon icon="mdi:text-box-outline" class="icon-mr-1" />
          내용 *
        </label>
        <WikiQuillEditor
          :value="wiki.content"
          @input="updateField('content', $event)"
          placeholder="마크다운으로 내용을 입력하세요"
        />
      </div>
      <div class="wiki-editor-actions">
        <!-- 임시저장 버튼과 문법 가이드 (왼쪽) -->
        <div class="wiki-editor-actions-left">
          <button 
            type="button" 
            @click="saveDraft" 
            :disabled="isDraftLoading"
            class="btn-draft"
          >
            <Icon :icon="isDraftLoading ? 'mdi:loading' : 'mdi:content-save-outline'" class="icon-mr-2" :class="{ 'animate-spin': isDraftLoading }" />
            {{ isDraftLoading ? '저장 중...' : '임시저장' }}
          </button>
          <NuxtLink to="/wiki/syntax" class="link-flex">
            <Icon icon="mdi:help-circle-outline" class="icon-mr-1" />
            마크 문법 가이드 보기
          </NuxtLink>
        </div>
        
        <!-- 기존 버튼들 (오른쪽) -->
        <div class="wiki-editor-actions-right">
          <button type="submit" class="btn-primary btn-icon">
            <Icon :icon="isEditing ? 'mdi:content-save' : 'mdi:send'" class="icon-mr-2" />
            {{ isEditing ? '수정하기' : '작성하기' }}
          </button>
          <NuxtLink to="/wiki" class="btn-secondary btn-icon">
            <Icon icon="mdi:format-list-bulleted" class="icon-mr-2" />
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
  
}
</script>