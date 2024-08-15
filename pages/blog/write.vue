<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 dark:text-white flex items-center">
      <Icon :icon="isEditing ? 'mdi:pencil' : 'mdi:pencil-plus'" class="mr-2 text-blue-500" width="36" height="36" />
      {{ isEditing ? '블로그 포스트 수정' : '새 블로그 포스트 작성' }}
    </h1>
    <form @submit.prevent="confirmSubmit" class="space-y-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
          <Icon icon="mdi:format-title" class="mr-1" />
          제목 *
        </label>
        <input type="text" id="title" v-model="post.title" required
               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
      </div>
      <div>
        <label for="categoryId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
          <Icon icon="mdi:folder-outline" class="mr-1" />
          카테고리 *
        </label>
        <select id="categoryId" v-model="post.categoryId" required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
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
        <CommonQuillEditor v-model="post.content" />
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
        <NuxtLink to="/blog" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-200 flex items-center">
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
import CommonQuillEditor from '~/components/CommonQuillEditor.vue'
import { useModal } from '~/composables/useModal'
import { useCategoryStore } from '~/stores/categoryStore'
import { Icon } from '@iconify/vue'

const route = useRoute()
const router = useRouter()
const { openModal } = useModal()
const categoryStore = useCategoryStore()

definePageMeta({
  layout: 'blog',
  name: 'blog-write'
})

const isEditing = ref(false)
const post = ref({
  title: '',
  content: '',
  categoryId: ''
})

const { data: categories } = await useFetch('/api/categories')

onMounted(async () => {
  if (route.query.id) {
    isEditing.value = true
    const { data, error } = await useFetch(`/api/blogPosts?id=${route.query.id}`)
    if (error.value) {
      openModal('오류', '블로그 포스트를 불러오는데 실패했습니다.')
      return
    }
    post.value = data.value
  }
})

function confirmSubmit() {
  if (!post.value.title || !post.value.content || !post.value.categoryId) {
    openModal('경고', '제목, 내용, 카테고리는 필수 입력 항목입니다.')
    return
  }

  openModal('확인', `블로그 포스트를 ${isEditing.value ? '수정' : '작성'}하시겠습니까?`, async (confirmed) => {
    if (confirmed) {
      await submitPost()
    }
  }, true)
}

async function submitPost() {
  const url = isEditing.value ? `/api/blogPosts?id=${route.query.id}` : '/api/blogPosts'
  const method = isEditing.value ? 'PUT' : 'POST'

  const { error } = await useFetch(url, {
    method,
    body: post.value
  })

  if (error.value) {
    console.error('블로그 포스트 처리 중 오류:', error.value)
    openModal('오류', `블로그 포스트 ${isEditing.value ? '수정' : '작성'}이 실패했습니다.`)
  } else {
    openModal('성공', `블로그 포스트가 성공적으로 ${isEditing.value ? '수정' : '작성'}되었습니다.`, async () => {
      if (!isEditing.value) {
        categoryStore.updateCategoryCount(post.value.categoryId)
      }
      await categoryStore.fetchCategories()
      router.push('/blog')
    })
  }
}

function cancelEdit() {
  router.push(`/blog/view?id=${route.query.id}`)
}
</script>