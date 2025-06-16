<template>
    <div class="mt-8 bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
      <div class="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-700 dark:text-gray-400">페이지당 항목:</span>
          <select 
            v-model="selectedItemsPerPage" 
            @change="changeItemsPerPage" 
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option v-for="option in itemsPerPageOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>
        <div class="flex-grow flex justify-center items-center space-x-2">
          <button 
            v-if="showPrevious"
            @click="goToPreviousSet" 
            class="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            &lt;
          </button>
          <button 
            v-for="page in visiblePages" 
            :key="page" 
            @click="goToPage(page)" 
            :class="[
              'px-4 py-2 text-sm font-medium rounded-lg',
              page === currentPage
                ? 'text-blue-600 bg-blue-50 border border-blue-500 dark:bg-blue-900 dark:text-blue-200'
                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
            ]"
          >
            {{ page }}
          </button>
          <button 
            v-if="showNext"
            @click="goToNextSet" 
            class="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue'
  
  const props = defineProps({
    totalItems: Number,
    itemsPerPage: Number,
    currentPage: Number,
  })
  
  const emit = defineEmits(['page-change', 'items-per-page-change'])
  
  const itemsPerPageOptions = [10, 20, 40, 80, 100]
  const selectedItemsPerPage = ref(props.itemsPerPage)
  
  const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage))
  
  const visiblePages = computed(() => {
    if (totalPages.value === 0) return [] // 총 페이지가 0일 때 빈 배열 반환
    const start = Math.floor((props.currentPage - 1) / 10) * 10 + 1
    const end = Math.min(start + 9, totalPages.value)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  })
  
  const showPrevious = computed(() => props.currentPage > 10)
  const showNext = computed(() => props.currentPage <= totalPages.value - 10)
  
  /**
   * 특정 페이지로 이동하는 함수입니다.
   * 부모 컴포넌트에 'page-change' 이벤트를 발생시켜 페이지 변경을 알립니다.
   * @param {number} page - 이동할 페이지 번호.
   */
  function goToPage(page) {
    emit('page-change', page)
  }
  
  /**
   * 이전 10개 페이지 세트로 이동하는 함수입니다.
   * 현재 페이지에서 10을 뺀 값으로 이동하며, 최소 페이지는 1입니다.
   * 부모 컴포넌트에 'page-change' 이벤트를 발생시켜 페이지 변경을 알립니다.
   */
  function goToPreviousSet() {
    const newPage = Math.max(1, props.currentPage - 10)
    emit('page-change', newPage)
  }
  
  /**
   * 다음 10개 페이지 세트로 이동하는 함수입니다.
   * 현재 페이지에서 10을 더한 값으로 이동하며, 최대 페이지는 `totalPages`입니다.
   * 부모 컴포넌트에 'page-change' 이벤트를 발생시켜 페이지 변경을 알립니다.
   */
  function goToNextSet() {
    const newPage = Math.min(totalPages.value, props.currentPage + 10)
    emit('page-change', newPage)
  }
  
  /**
   * 페이지당 항목 수 변경 시 호출되는 함수입니다.
   * `selectedItemsPerPage` 값으로 부모 컴포넌트에 'items-per-page-change' 이벤트를 발생시켜 변경을 알립니다.
   */
  function changeItemsPerPage() {
    emit('items-per-page-change', selectedItemsPerPage.value)
  }
  
  // props 변경 감지 및 selectedItemsPerPage 업데이트
  /**
   * `props.itemsPerPage`가 변경될 때 `selectedItemsPerPage`를 업데이트하는 watch 훅입니다.
   * @param {number} newValue - `props.itemsPerPage`의 새 값.
   */
  watch(() => props.itemsPerPage, function(newValue) {
    selectedItemsPerPage.value = newValue
  })
  </script>