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
  }
})

const route = useRoute()
const router = useRouter()
const { openModal } = useModal()

const isEditing = ref(false)
const wiki = ref({ title: '', content: '' })

onMounted(async () => {
  if (route.query.id) {
    isEditing.value = true
    const { data, error } = await useFetch(`${props.apiEndpoint}?id=${route.query.id}`)
    if (error.value) {
      openModal('오류', 'Wiki 페이지를 불러오는데 실패했습니다.')
      return
    }
    wiki.value = data.value
  }
})

function updateField(fieldName, event) {
  post.value[fieldName] = event.target ? event.target.value : event
  //console.log(`Field ${fieldName} updated:`, post.value[fieldName])
}


async function submitWiki() {
  const url = isEditing.value ? `${props.apiEndpoint}?id=${route.query.id}` : props.apiEndpoint
  const method = isEditing.value ? 'PUT' : 'POST'

  try {
    const response = await $fetch(url, {
      method,
      body: wiki.value
    })

    openModal('성공', `Wiki 페이지가 성공적으로 ${isEditing.value ? '수정' : '작성'}되었습니다.`, () => {
      router.push('/wiki')
    })
  } catch (error) {
    console.error('Error submitting wiki:', error)
    let errorMessage = `Wiki 페이지 ${isEditing.value ? '수정' : '작성'}에 실패했습니다.`
    if (error.response && error.response.statusMessage) {
      errorMessage += ` ${error.response.statusMessage}`
    }
    openModal('오류', errorMessage)
  }
}
</script>