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
      <div class="flex justify-end space-x-4">
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
  const pending = ref(false)
  const error = ref(null)
  const categories = ref([])

  onMounted(async () => {
    try {
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
      }
    } catch (e) {
      error.value = e
      openModal('오류', '카테고리 목록을 불러오는데 실패했습니다.')
    }
  })
  
  function updateField(fieldName, event) {
    post.value[fieldName] = event.target ? event.target.value : event
    //console.log(`Field ${fieldName} updated:`, post.value[fieldName])
  }
  
  async function submitPost() {
    const url = isEditing.value ? `${props.apiEndpoint}?id=${route.query.id}` : props.apiEndpoint
    const method = isEditing.value ? 'PUT' : 'POST'
  
    try {
      const response = await $fetch(url, {
        method,
        body: post.value
      })
  
      openModal('성공', `블로그 글이 성공적으로 ${isEditing.value ? '수정' : '작성'}되었습니다.`, () => {
        router.push(isEditing.value ? `${props.listPath}/view?id=${route.query.id}` : props.listPath)
      })
    } catch (error) {
      console.error('Error submitting post:', error)
      openModal('오류', `블로그 글 ${isEditing.value ? '수정' : '작성'}에 실패했습니다.`)
    }
  }
  
  function cancelEdit() {
    router.push(`${props.listPath}/view?id=${route.query.id}`)
  }
  </script>