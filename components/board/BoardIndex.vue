<template>
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-6 dark:text-white text-center flex items-center justify-center">
        <Icon :icon="boardIcon" class="mr-2" />
        {{ boardTitle }}
      </h1>
      <div class="bg-white dark:bg-gray-800 dark:text-white shadow-md rounded-lg overflow-hidden overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead :class="headerColorClass">
            <tr>
              <th v-for="header in tableHeaders" :key="header.key" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider dark:text-gray-200" :class="header.class">
                <Icon :icon="header.icon" class="inline mr-1" />{{ header.label }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:text-white">
            <tr v-for="post in posts" :key="post.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td v-for="header in tableHeaders" :key="header.key" class="px-6 py-4 whitespace-nowrap" :class="header.class">
                <template v-if="header.key === 'title'">
                  <NuxtLink :to="`/${boardType}/view?id=${post.id}`" class="text-sm font-medium text-blue-600 hover:text-blue-800 dark:hover:text-blue-600 dark:text-white">
                    <span class="block sm:hidden text-xs text-gray-500 dark:text-gray-400">
                      <Icon icon="mdi:account" class="inline mr-1" />{{ post.author }} | 
                      <Icon icon="mdi:calendar" class="inline mr-1" />{{ formatDate(post.createdAt) }}
                    </span>
                    <span class="truncate block max-w-xs sm:max-w-none">
                      <Icon icon="mdi:text" class="inline mr-1" />{{ post.title }}
                    </span>
                  </NuxtLink>
                </template>
                <template v-else>
                  {{ post[header.key] }}
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-6">
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
  import { ref, watchEffect } from 'vue'
  import SearchBar from '~/components/board/SearchBar.vue'
  import Pagination from '~/components/board/Pagination.vue'
  import { Icon } from '@iconify/vue'
  
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
    }
  })
  
  const totalItems = ref(0)
  const itemsPerPage = ref(10)
  const currentPage = ref(1)
  const searchParams = ref({ type: 'title', text: '' })
  
  const { data: posts, error, refresh } = await useAsyncData('boardPosts', async () => {
    const response = await $fetch(props.apiEndpoint, {
      params: {
        page: currentPage.value,
        itemsPerPage: itemsPerPage.value,
        type: searchParams.value.type,
        text: searchParams.value.text
      }
    })
    totalItems.value = response.total
    return response.posts
  }, {
    watch: [currentPage, itemsPerPage, searchParams]
  })
  
  const handleSearch = async (params) => {
    searchParams.value = params
    currentPage.value = 1
  }
  
  const handlePageChange = async (page) => {
    currentPage.value = page
  }
  
  const handleItemsPerPageChange = async (newItemsPerPage) => {
    itemsPerPage.value = newItemsPerPage
    currentPage.value = 1
  }
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  </script>