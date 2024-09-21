<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-8 dark:text-white flex items-center">
      <Icon icon="mdi:post-outline" class="mr-3 text-blue-500" width="40" height="40" />
      {{ title }}
    </h1>
    
    <div v-if="pending" class="flex justify-center items-center h-64">
      <Icon icon="eos-icons:loading" class="text-blue-500" width="48" height="48" />
    </div>
    
    <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
      <p class="font-bold">에러 발생</p>
      <p>{{ error }}</p>
    </div>
    
    <div v-else>
      <div v-if="posts.length === 0" class="text-center text-gray-600 dark:text-gray-400 py-12">
        <Icon icon="mdi:folder-open-outline" class="mx-auto mb-4" width="64" height="64" />
        <p>{{ emptyMessage }}</p>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="post in posts" :key="post.id" 
             class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
             @click="navigateToPost(post.id)">
          <div class="p-6">
            <h2 class="text-xl font-semibold mb-3 dark:text-white group">
              <span class="hover:text-blue-500 transition-colors duration-200 flex items-center">
                <Icon icon="mdi:file-document-outline" class="mr-2 group-hover:text-blue-500" />
                {{ post.title }}
              </span>
            </h2>
            <p class="text-gray-600 dark:text-gray-300 mb-4 text-sm" v-html="post.content.substring(0, 100) + '...'"></p>
            <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Icon icon="mdi:calendar" class="mr-1" />
              <span>{{ formatDate(post.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="mt-8 text-right">
      <NuxtLink :to="writeLink" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center transition-colors duration-200">
        <Icon icon="mdi:pencil" class="mr-2" />
        {{ writeButtonText }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  title: { type: String, default: '블로그' },
  emptyMessage: { type: String, default: '게시물이 존재하지 않습니다.' },
  writeButtonText: { type: String, default: '글쓰기' },
  writeLink: { type: String, default: '/blog/write' },
  postLink: { type: String, default: '/blog/view' },
  apiEndpoint: { type: String, required: true }
})

const posts = ref([])
const pending = ref(false)
const error = ref(null)

const router = useRouter()

function navigateToPost(postId) {
  router.push(`${props.postLink}?id=${postId}`)
}

async function fetchPosts() {
  pending.value = true
  try {
    const { data } = await useFetch(props.apiEndpoint, {
      method: 'GET'
    })
    posts.value = data.value
  } catch (e) {
    error.value = e
  } finally {
    pending.value = false
  }
}

onBeforeMount(fetchPosts)
onMounted(fetchPosts)


function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString()
}
</script>