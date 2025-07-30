<template>
  <div class="modal-overlay">
    <div class="card-padded gallery-modal-container">
      <div class="gallery-modal-header">
        <h2 class="gallery-modal-title">
          {{ item.id ? '갤러리 항목 수정' : '새 갤러리 항목 추가' }}
        </h2>
        <button @click="$emit('close')" class="modal-close-btn">
          <Icon icon="mdi:close" class="gallery-modal-close" />
        </button>
      </div>
      <form @submit.prevent="saveItem">
        <div class="mb-4">
          <label for="title" class="form-label">제목</label>
          <input type="text" id="title" v-model="editedItem.title" required placeholder="제목을 입력하세요" class="input mt-1">
        </div>
        <div class="mb-4">
          <label class="form-label">내용</label>
          <CommonQuillEditor
            :value="editedItem.content"
            placeholder="내용을 입력하세요..."
            @input="handleQuillInput"
          />
        </div>
        <div class="mb-4">
          <label for="tags" class="form-label">태그</label>
          <div class="gallery-tag-list">
            <span v-for="tag in tags" :key="tag" class="badge-gray">
              {{ tag }}
              <button @click="removeTag(tag)" class="gallery-tag-remove-btn">
                <Icon icon="mdi:close" class="gallery-tag-icon" />
              </button>
            </span>
          </div>
          <div class="gallery-tag-input-wrapper">
            <input 
              type="text" 
              id="tags" 
              v-model="newTag" 
              @keydown.enter.prevent="addTag"
              placeholder="새 태그 입력 후 Enter" 
              class="gallery-tag-input"
            >
            <button 
              type="button" 
              @click="clearTags" 
              class="gallery-tag-clear-btn"
            >
              초기화
            </button>
          </div>
        </div>
        <div class="gallery-form-actions">
          <button type="submit" class="btn-primary btn-icon">
            <Icon icon="mdi:content-save" class="icon-small mr-2" />
            저장
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import { Icon } from '@iconify/vue'
// 🚀 에디터 지연 로딩
const CommonQuillEditor = defineAsyncComponent(() => import('~/components/CommonQuillEditor.vue'))

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  apiEndpoint: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'save'])

const editedItem = ref({ ...props.item, content: props.item.content || '' })
const tags = ref([...props.item.tags] || [])
const newTag = ref('')

/**
 * 새로운 태그를 추가하는 함수입니다.
 * 입력된 태그가 비어있지 않고 이미 존재하는 태그가 아니면 `tags` 배열에 추가하고 입력 필드를 초기화합니다.
 */
function addTag() {
  const trimmedTag = newTag.value.trim()
  if (trimmedTag && !tags.value.includes(trimmedTag)) {
    tags.value.push(trimmedTag)
    newTag.value = ''
  }
}

/**
 * 특정 태그를 제거하는 함수입니다.
 * @param {string} tag - 제거할 태그 문자열.
 */
function removeTag(tag) {
  tags.value = tags.value.filter(function(t) { return t !== tag })
}

/**
 * 모든 태그를 제거하여 `tags` 배열을 비우는 함수입니다.
 */
function clearTags() {
  tags.value = []
}

/**
 * CommonQuillEditor 컴포넌트에서 `input` 이벤트가 발생했을 때 호출되는 핸들러 함수입니다.
 * 에디터의 콘텐츠를 `editedItem.content`에 업데이트합니다.
 * @param {string} content - Quill 에디터의 HTML 콘텐츠.
 */
function handleQuillInput(content) {
  editedItem.value.content = content
}

/**
 * 갤러리 항목을 저장하는 비동기 함수입니다. (생성 또는 수정)
 * `editedItem`과 `tags`를 포함하여 API 엔드포인트로 요청을 보냅니다.
 * 성공 시 `save` 이벤트를 발생시켜 업데이트된 항목을 부모 컴포넌트로 전달합니다.
 */
async function saveItem() {
  const updatedItem = {
    ...editedItem.value,
    tags: tags.value
  }
  
  const response = await $fetch(props.apiEndpoint, {
    method: updatedItem.id ? 'PUT' : 'POST',
    body: updatedItem
  })
  
  emit('save', response)
}
</script>