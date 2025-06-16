<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 dark:text-white flex items-center">
      <Icon :icon="isEditing ? 'mdi:pencil' : 'mdi:pencil-plus'" class="mr-2" />
      {{ isEditing ? 'Wiki 페이지 수정' : '새 Wiki 페이지 작성' }}
    </h1>
    <form @submit.prevent="submitWiki" class="space-y-4">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
          <Icon icon="mdi:format-title" class="mr-1" />
          제목
        </label>
        <input
          v-model="wiki.title"
          id="title"
          type="text"
          class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          placeholder="Wiki 페이지 제목"
          required
        >
      </div>
      <div>
        <label for="content" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
          <Icon icon="mdi:text-box-outline" class="mr-1" />
          내용
        </label>
        <WikiQuillEditor
          :value="wiki.content"
          @input="updateField(wiki.content, $event)"
          placeholder="Wiki 내용을 입력하세요"
        />
      </div>
      <div class="flex justify-between">
        <NuxtLink to="/wiki/syntax" class="text-blue-500 hover:text-blue-600 flex items-center mt-2">
          <Icon icon="mdi:help-circle-outline" class="mr-1" />
          마크 문법 가이드 보기
        </NuxtLink>
        <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center">
          <Icon :icon="isEditing ? 'mdi:content-save' : 'mdi:send'" class="mr-2" />
          {{ isEditing ? '수정하기' : '작성하기' }}
        </button>
        <NuxtLink to="/wiki" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 flex items-center">
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
import WikiQuillEditor from '~/components/wiki/WikiQuillEditor.vue'

const props = defineProps({
  apiEndpoint: {
    type: String,
    required: true
  },
  fields: {
    type: Array,
    default: []
  }
})

const route = useRoute()
const router = useRouter()
const { openModal } = useModal()

const isEditing = ref(false)
const wiki = ref({ title: '', content: '' })

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

/**
 * 위키 페이지를 제출(생성 또는 수정)하는 함수입니다.
 * 필수 필드가 비어있는지 확인하고, 유효성 검사 실패 시 경고 모달을 표시합니다.
 * API를 호출하여 위키 페이지를 저장하고,
 * 성공 시 성공 모달을 띄우고 위키 페이지 상세 또는 목록으로 이동하며,
 * 실패 시 오류 모달을 띄웁니다.
 */
async function submitWiki() {
  const requiredFields = props.fields.filter(field => field.required).map(field => field.name)
  const missingFields = requiredFields.filter(field => !wiki.value[field])

  if (missingFields.length > 0) {
    openModal('경고', `다음 필드를 입력해주세요: ${missingFields.join(', ')}`)
    return
  }

  //console.log('Submitting wiki:', wiki.value)

  const url = isEditing.value ? `${props.apiEndpoint}?id=${route.query.id}` : props.apiEndpoint
  const method = isEditing.value ? 'PUT' : 'POST'

  try {
    const response = await $fetch(url, {
      method,
      body: wiki.value
    })

    openModal('성공', `위키 페이지가 성공적으로 ${isEditing.value ? '수정' : '작성'}되었습니다.`, () => {
      router.push(isEditing.value ? `/wiki/view?id=${route.query.id}` : '/wiki')
    })
  } catch (error) {
    console.error('Error submitting wiki:', error)
    openModal('오류', `위키 페이지 ${isEditing.value ? '수정' : '작성'}에 실패했습니다.`) 
  }
}

/**
 * 위키 페이지 수정을 취소하고 위키 페이지 상세 보기로 돌아가는 함수입니다.
 */
function cancelEdit() {
  router.push(`/wiki/view?id=${route.query.id}`)
}

onMounted(async () => {
  props.fields.forEach(field => {
    wiki.value[field.name] = ''
  })

  if (route.query.id) {
    isEditing.value = true
    try {
      const { data } = await useFetch(`${props.apiEndpoint}?id=${route.query.id}`)
      if (data.value) {
        wiki.value = data.value
      } else {
        openModal('오류', '위키 페이지를 불러오는데 실패했습니다.')
      }
    } catch (e) {
      error.value = e
      openModal('오류', '위키 페이지를 불러오는데 실패했습니다.')
    }
  }
})
</script>