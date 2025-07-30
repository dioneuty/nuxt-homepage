<template>
    <div class="pagination-container">
      <div class="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-700 dark:text-gray-400">페이지당 항목:</span>
          <select 
            v-model="selectedItemsPerPage" 
            @change="changeItemsPerPage" 
            class="pagination-select"
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
            class="pagination-btn-inactive"
          >
            &lt;
          </button>
          <button 
            v-for="page in visiblePages" 
            :key="page" 
            @click="goToPage(page)" 
            :class="[
              page === currentPage
                ? 'pagination-btn-active'
                : 'pagination-btn-inactive'
            ]"
          >
            {{ page }}
          </button>
          <button 
            v-if="showNext"
            @click="goToNextSet" 
            class="pagination-btn-inactive"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue'
  import { usePagination } from '~/composables/usePagination.js'
  
  /**
   * 페이지네이션 컴포넌트의 props 정의입니다.
   * @property {number} totalItems - 전체 항목 수
   * @property {number} itemsPerPage - 페이지당 표시할 항목 수
   * @property {number} currentPage - 현재 페이지 번호
   */
  const props = defineProps({
    totalItems: Number,
    itemsPerPage: Number,
    currentPage: Number,
  })
  
  /**
   * 페이지네이션 컴포넌트에서 발생하는 이벤트들을 정의합니다.
   * @emits {number} page-change - 페이지 변경 시 발생하는 이벤트
   * @emits {number} items-per-page-change - 페이지당 항목 수 변경 시 발생하는 이벤트
   */
  const emit = defineEmits(['page-change', 'items-per-page-change'])
  
  /**
   * 페이지당 표시할 수 있는 항목 수 옵션들입니다.
   */
  const itemsPerPageOptions = [10, 20, 40, 80, 100]
  
  /**
   * 현재 선택된 페이지당 항목 수입니다.
   * props.itemsPerPage의 초기값으로 설정됩니다.
   */
  const selectedItemsPerPage = ref(props.itemsPerPage)
  
  /**
   * 전체 페이지 수를 계산합니다.
   * 전체 항목 수를 페이지당 항목 수로 나누어 올림한 값입니다.
   */
  const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage))
  
  /**
   * usePagination 컴포저블을 사용하여 현재 페이지에서 보여줄 페이지 번호들을 계산합니다.
   */
  const { visiblePages } = usePagination(totalPages, computed(() => props.currentPage));
  
  /**
   * 이전 페이지 세트 버튼의 표시 여부를 결정합니다.
   * 현재 페이지가 10보다 클 때 표시됩니다.
   */
  const showPrevious = computed(() => props.currentPage > 10)
  
  /**
   * 다음 페이지 세트 버튼의 표시 여부를 결정합니다.
   * 현재 페이지가 전체 페이지 수에서 10을 뺀 값보다 작거나 같을 때 표시됩니다.
   */
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