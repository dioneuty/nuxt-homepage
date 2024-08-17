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
  
function updateField(fieldName, event) {
  post.value[fieldName] = event.target ? event.target.value : event
  //console.log(`Field ${fieldName} updated:`, post.value[fieldName])
}

async function submitPost() {
  const requiredFields = props.fields.filter(field => field.required).map(field => field.name)
  const missingFields = requiredFields.filter(field => !post.value[field])

  if (missingFields.length > 0) {
    openModal('경고', `다음 필드를 입력해주세요: ${missingFields.join(', ')}`)
    return
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
  
function cancelEdit() {
  router.push(`${props.listPath}/view?id=${route.query.id}`)
}
</script>