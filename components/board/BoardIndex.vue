<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6 dark:text-white text-center flex items-center justify-center">
      <Icon :icon="boardIcon" class="mr-2" />
      {{ boardTitle }}
    </h1>
    <div class="bg-white dark:bg-gray-800 dark:text-white shadow-md rounded-lg overflow-hidden overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead :class="headerColorClass">
          <draggable v-model="localHeaders" item-key="key" tag="tr" @end="onDragEnd">
            <template #item="{ element: header }">
              <th 
                scope="col" 
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider dark:text-gray-200 cursor-move border-r border-gray-300 dark:border-gray-600 last:border-r-0" 
                :class="header.class" 
                @click="header.sortable !== false && toggleSort(header.key)"
              >
                <div class="flex items-center">
                  <Icon :icon="header.icon" class="inline mr-1" />
                  {{ header.label }}
                  <Icon v-if="header.sortable !== false" :icon="header.sortIcon" class="ml-1" />
                </div>
              </th>
            </template>
          </draggable>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:text-white">
          <template v-if="initialLoading">
            <tr v-for="i in itemsPerPage" :key="i" class="h-16">
              <td :colspan="localHeaders.length" class="px-6 py-4 text-center">
                <div v-if="i === Math.ceil(itemsPerPage / 2)" class="flex justify-center items-center h-full">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                  <span class="ml-2">로딩 중...</span>
                </div>
              </td>
            </tr>
          </template>
          <template v-else-if="posts && posts.length">
            <tr v-for="post in posts" :key="post.id" class="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" @click="goToPostDetail(post.id)">
              <td v-for="header in localHeaders" :key="header.key" class="px-6 py-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-700 last:border-r-0" :class="header.class">
                <template v-if="header.key === 'title'">
                  <span class="block sm:hidden text-xs text-gray-500 dark:text-gray-400">
                    <Icon icon="mdi:account" class="inline mr-1" />{{ post.author }} | 
                    <Icon icon="mdi:calendar" class="inline mr-1" />{{ formatDate(post.createdAt) }}
                  </span>
                  <span class="truncate block max-w-xs sm:max-w-none">
                    <Icon icon="mdi:text" class="inline mr-1" />{{ post.title }}
                  </span>
                </template>
                <template v-else>
                  {{ post[header.key] }}
                </template>
              </td>
            </tr>
          </template>
          <template v-else>
            <tr>
              <td :colspan="localHeaders.length" class="px-6 py-4 text-center">
                게시물이 없습니다.
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <div class="mt-6" v-if="showWriteButton">
      <slot name="write-button">
        <NuxtLink :to="`/${boardType}/write`" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <Icon icon="mdi:pencil-plus" class="mr-2" />
          새 글 작성
        </NuxtLink>
      </slot>
    </div>
    
    <SearchBar @search="handleSearch" />
    
    <Pagination 
      :total-items="totalItems" 
      :items-per-page="itemsPerPage" 
      :current-page="currentPage"
      @page-change="handlePageChange"
      @items-per-page-change="handleItemsPerPageChange"
    />
  </div>
</template>

<script setup>
import { ref, watchEffect, computed, onMounted } from 'vue'
import SearchBar from '~/components/board/SearchBar.vue'
import Pagination from '~/components/board/Pagination.vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import draggable from 'vuedraggable'
import { useAuth } from '~/composables/useAuth'

const props = defineProps({
  boardType: {
    type: String,
    required: true
  },
  boardTitle: {
    type: String,
    required: true
  },
  boardIcon: {
    type: String,
    required: true
  },
  apiEndpoint: {
    type: String,
    required: true
  },
  headerColorClass: {
    type: String,
    default: 'bg-green-100 dark:bg-green-800'
  },
  tableHeaders: {
    type: Array,
    required: true
  },
  showWriteButton: {
    type: Boolean,
    default: true
  },
  isAdminBoard: {
    type: Boolean,
    default: false
  }
})

const totalItems = ref(0)
const itemsPerPage = ref(10)
const currentPage = ref(1)
const searchParams = ref({ type: 'title', text: '' })
const sortColumn = ref('')
const sortOrder = ref('asc')

const localHeaders = ref([...props.tableHeaders])

const sortedHeaders = computed(() => {
  return localHeaders.value.map(header => ({
    ...header,
    sortable: header.sortable !== false,
    sortIcon: getSortIcon(header.key)
  }))
})

function getSortIcon(key) {
  if (sortColumn.value !== key) return 'mdi:sort'
  return sortOrder.value === 'asc' ? 'mdi:sort-ascending' : 'mdi:sort-descending'
}

function toggleSort(key) {
  if (sortColumn.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = key
    sortOrder.value = 'asc'
  }
  currentPage.value = 1
  refresh()
}

const initialLoading = ref(true)

//로그인한 유저이면서 role이 admin인 유저만 보도록 하기
const auth = useAuth().auth.value

const { data: posts, error, refresh } = await useAsyncData(props.apiEndpoint, async function() {
  try {
    let response
    if (!props.isAdminBoard || (props.isAdminBoard && auth.isLoggedIn && auth.user.role === 'ADMIN')) {
       response = await $fetch(props.apiEndpoint, {
      params: {
        page: currentPage.value,
        itemsPerPage: itemsPerPage.value,
        type: searchParams.value.type,
        text: searchParams.value.text,
        sortColumn: sortColumn.value,
        sortOrder: sortOrder.value
      }
      })
    }else{
      router.push('/')
    }

    totalItems.value = response.total
    return response.posts
  } finally {
    initialLoading.value = false
  }
}, {
  watch: [currentPage, itemsPerPage, searchParams, sortColumn, sortOrder],
  server: false
})



onMounted(function() {
  if (posts.value) {
    initialLoading.value = false
  }
})

async function handleSearch(params) {
  searchParams.value = params
  currentPage.value = 1
}

async function handlePageChange(page) {
  currentPage.value = page
}

async function handleItemsPerPageChange(newItemsPerPage) {
  itemsPerPage.value = newItemsPerPage
  currentPage.value = 1
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const router = useRouter()

function goToPostDetail(postId) {
  router.push(`/${props.boardType}/view?id=${postId}`)
}

function onDragEnd() {
  // 변경된 헤더 순서를 로컬 스토리지에 저장
  localStorage.setItem(`${props.boardType}_headerOrder`, JSON.stringify(localHeaders.value.map(function(h) { return h.key })))
  console.log('New header order:', localHeaders.value)
}

onMounted(function() {
  // 저장된 헤더 순서 불러오기
  const savedOrder = JSON.parse(localStorage.getItem(`${props.boardType}_headerOrder`))
  if (savedOrder) {
    localHeaders.value = savedOrder.map(function(key) { 
      return props.tableHeaders.find(function(h) { return h.key === key }) 
    }).filter(Boolean)
  }
})
</script>

<style scoped>
/* 필요한 경우 추가 스타일 */
</style>