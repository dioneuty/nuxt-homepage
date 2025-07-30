<template>
    <div class="search-bar-container">
      <div class="search-bar-wrapper">
        <div class="search-bar-content">
          <select 
            v-model="searchType" 
            class="search-select"
          >
            <option value="author">글쓴이</option>
            <option value="title">제목</option>
            <option value="content">내용</option>
          </select>
          <input 
            v-model="searchText" 
            type="text" 
            placeholder="검색어를 입력하세요" 
            class="search-input"
          >
          <button 
            @click="search" 
            class="search-button"
          >
            검색
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const searchType = ref('title') // 검색 타입
  const searchText = ref('') // 검색어
  
  const emit = defineEmits(['search']) // 검색 이벤트 발생 시 호출되는 함수
  
  /**
   * 검색 버튼 클릭 시 호출되는 함수입니다.
   * 현재 `searchType`과 `searchText` 값을 포함하는 객체를 `search` 이벤트와 함께 부모 컴포넌트로 전달합니다.
   */
  function search() {
    emit('search', { type: searchType.value, text: searchText.value })
  }
  </script>