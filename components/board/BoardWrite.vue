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
    </form>
  </div>
</template>
  
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useModal } from '~/composables/useModal'
import { Icon } from '@iconify/vue'
import CommonQuillEditor from '~/components/CommonQuillEditor.vue'

/**
 * 필수 필드의 유효성을 검사하고, 누락된 필드가 있을 경우 경고 모달을 표시합니다.
 * @param {object} postData - 현재 게시물 데이터.
 * @param {Array} fields - 필드 정의 배열 (required 속성 포함).
 * @param {function} openModalFn - useModal의 openModal 함수.
 * @returns {boolean} 모든 필수 필드가 채워졌으면 true, 아니면 false.
 */
function validateRequiredFields(postData, fields, openModalFn) {
  const requiredFields = fields.filter(field => field.required).map(field => field.name);
  const missingFields = requiredFields.filter(field => !postData[field]);

  if (missingFields.length > 0) {
    openModalFn('경고', `다음 필드를 입력해주세요: ${missingFields.join(', ')}`);
    return false;
  }
  return true;
}

const props = defineProps({
  apiEndpoint: {
    type: String,
    required: true
  },
  fields: {
    type: Array,
    required: true
  },
  listPath: {
    type: String,
    required: true
  }
})
  
const route = useRoute()
const router = useRouter()
const { openModal } = useModal()
  
const isEditing = ref(false)
const post = ref({})
  
onMounted(async () => {
  props.fields.forEach(field => {
    post.value[field.name] = ''
  })
  
  if (route.query.id) {
    isEditing.value = true
    const { data, error } = await useFetch(`${props.apiEndpoint}?id=${route.query.id}`)
    if (error.value) {
      openModal('오류', '게시글을 불러오는데 실패했습니다.')
      return
    }
    post.value = data.value
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
 * 게시글을 제출(생성 또는 수정)하는 함수입니다.
 * 필수 필드가 비어있는지 확인하고, 유효성 검사 실패 시 경고 모달을 표시합니다.
 * API를 호출하여 게시글을 저장하고,
 * 성공 시 성공 모달을 띄우고 게시글 상세 또는 목록 페이지로 이동하며,
 * 실패 시 오류 모달을 띄웁니다.
 */
async function submitPost() {
  if (!validateRequiredFields(post.value, props.fields, openModal)) {
    return;
  }

  //console.log('Submitting post:', post.value)

  const url = isEditing.value ? `${props.apiEndpoint}?id=${route.query.id}` : props.apiEndpoint
  const method = isEditing.value ? 'PUT' : 'POST'

  try {
    const response = await $fetch(url, {
      method,
      body: post.value
    })

    openModal('성공', `게시글이 성공적으로 ${isEditing.value ? '수정' : '작성'}되었습니다.`, () => {
      if (isEditing.value) {
        router.push(`${props.listPath}/view?id=${route.query.id}`)
      } else {
        router.push(props.listPath)
      }
    })
  } catch (error) {
    console.error('Error submitting post:', error)
    openModal('오류', `게시글 ${isEditing.value ? '수정' : '작성'}에 실패했습니다.`) 
  }
}
  
/**
 * 게시글 수정을 취소하고 게시글 상세 페이지로 돌아가는 함수입니다.
 */
function cancelEdit() {
  router.push(`${props.listPath}/view?id=${route.query.id}`)
}
</script>