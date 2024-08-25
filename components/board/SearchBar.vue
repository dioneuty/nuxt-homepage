<template>
    <div class="mt-8 w-full md:w-2/3 lg:w-1/2 mx-auto">
      <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
        <div class="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <select 
            v-model="searchType" 
            class="w-full sm:w-1/3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="author">글쓴이</option>
            <option value="title">제목</option>
            <option value="content">내용</option>
          </select>
          <input 
            v-model="searchText" 
            type="text" 
            placeholder="검색어를 입력하세요" 
            class="w-full sm:w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
          <button 
            @click="search" 
            class="w-full sm:w-auto mt-2 sm:mt-0 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            검색
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const searchType = ref('title')
  const searchText = ref('')
  
  const emit = defineEmits(['search'])
  
  function search() {
    emit('search', { type: searchType.value, text: searchText.value })
  }
  </script>