<template>
  <div class="container mx-auto px-4 py-8 dark:bg-gray-800 dark:text-white">
    <h1 class="text-3xl font-bold mb-6 dark:text-white flex items-center">
      <Icon icon="mdi:frequently-asked-questions" class="mr-2" />
      질문과 답변
    </h1>
    <div class="mb-6 flex justify-between items-center">
      <NuxtLink to="/qna/write" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center">
        <Icon icon="mdi:pencil-plus" class="mr-2" />
        질문 작성하기
      </NuxtLink>
    </div>
    
    <!-- 검색 바 컴포넌트 -->
    <SearchBar @search="handleSearch" />
    
    <ul class="space-y-4 mt-6">
      <li v-for="qna in qnas" :key="qna.id" class="border p-4 rounded shadow hover:shadow-md transition dark:border-gray-700 dark:bg-gray-700">
        <NuxtLink :to="`/qna/view?id=${qna.id}`" class="block">
          <h2 class="text-xl font-semibold mb-2 dark:text-white flex items-center">
            <Icon icon="mdi:help-circle-outline" class="mr-2" />
            {{ qna.questionTitle }}
          </h2>
          <p class="text-gray-600 mb-2 dark:text-gray-300">{{ qna.questionContent.substring(0, 100) }}...</p>
          <div class="text-sm text-gray-500 mb-2 dark:text-gray-400 flex items-center">
            <Icon icon="mdi:account" class="mr-1" />
            작성자: {{ qna.author }} | 
            <Icon icon="mdi:calendar" class="ml-2 mr-1" />
            작성일: {{ formatDate(qna.createdAt) }}
          </div>
          <div class="flex items-center mb-2">
            <span :class="qna.answerContent ? 'bg-green-500' : 'bg-red-500'" class="px-2 py-1 rounded text-white text-xs mr-2 flex items-center">
              <Icon :icon="qna.answerContent ? 'mdi:check-circle' : 'mdi:clock-outline'" class="mr-1" />
              {{ qna.answerContent ? '답변 완료' : '답변 대기' }}
            </span>
          </div>
          <div v-if="qna.answerContent" class="bg-blue-50 p-3 rounded dark:bg-blue-900">
            <h3 class="font-semibold mb-1 dark:text-white flex items-center">
              <Icon icon="mdi:comment-text-outline" class="mr-2" />
              답변:
            </h3>
            <p class="text-gray-700 dark:text-gray-300">{{ qna.answerContent.substring(0, 100) }}...</p>
            <div class="text-sm text-gray-500 mt-1 dark:text-gray-400 flex items-center">
              <Icon icon="mdi:account" class="mr-1" />
              답변자: {{ qna.answerer }} | 
              <Icon icon="mdi:calendar" class="ml-2 mr-1" />
              답변일: {{ formatDate(qna.updatedAt) }}
            </div>
          </div>
        </NuxtLink>
      </li>
    </ul>
    
    <!-- 페이지네이션 컴포넌트 -->
    <Pagination 
      v-if="!isMobile"
      :total-items="totalItems" 
      :items-per-page="itemsPerPage" 
      :current-page="currentPage"
      @page-change="handlePageChange"
      @items-per-page-change="handleItemsPerPageChange"
    />

    <!-- 모바일 무한 스크롤 로딩 인디케이터 -->
    <div v-if="isMobile && loading" class="flex justify-center items-center py-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      <p class="ml-3 dark:text-gray-300">불러오는 중...</p>
    </div>
    <div v-if="isMobile && noMoreData && qnas.length > 0" class="text-center py-4 text-gray-500 dark:text-gray-400">
      더 이상 질문이 없습니다.
    </div>
    <div v-if="isMobile" ref="infiniteScrollTrigger" class="h-1"></div>
  </div>
</template>

<script setup>
import { ref, watchEffect, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SearchBar from '~/components/board/SearchBar.vue'
import Pagination from '~/components/board/Pagination.vue'
import { Icon } from '@iconify/vue'
import { formatDate } from '~/utils/dateFormatter'
import { useIsMobile } from '~/composables/useIsMobile'

definePageMeta ({
  title: '질문과 답변 - Dion',
  meta: [
    { name: 'description', content: 'Dion - 질문과 답변' },
    { name: 'keywords', content: 'Dion, 질문과 답변' }
  ]
})

const route = useRoute()
const router = useRouter()
const { isMobile } = useIsMobile()

const qnas = ref([])
const totalItems = ref(0)
const itemsPerPage = ref(10)
const currentPage = ref(1)
const searchParams = ref({ type: '', text: '' })
const loading = ref(false)
const noMoreData = ref(false)
const infiniteScrollTrigger = ref(null)
let observer = null

/**
 * @description Intersection Observer를 설정하거나 해제합니다.
 * @param {boolean} enable - Observer를 활성화할지 여부
 */
const setupIntersectionObserver = (enable) => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (enable && infiniteScrollTrigger.value) {
    observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      // console.log(`IntersectionObserver: isIntersecting: ${entry.isIntersecting}, loading: ${loading.value}, noMoreData: ${noMoreData.value}`);
      if (entry.isIntersecting && !loading.value && !noMoreData.value) {
        loadMore();
      } else if (entry.isIntersecting) {
        // console.log('IntersectionObserver: Intersecting, but conditions not met for loadMore.');
      }
    }, {
      rootMargin: '100px'
    });
    observer.observe(infiniteScrollTrigger.value);
  }
};

/**
 * @description Q&A 목록을 가져옵니다. `append`가 true이면 기존 목록에 추가합니다.
 * @param {boolean} append - 데이터를 기존 목록에 추가할지 여부
 */
const fetchQnAs = async (append = false) => {
  if (loading.value && append) {
    // console.log('fetchQnAs: Already loading, skipping.');
    return;
  }
  if (append && noMoreData.value) {
    // console.log('fetchQnAs: No more data, skipping.');
    return;
  }
  
  loading.value = true;
  // console.log(`fetchQnAs: Starting fetch for page ${currentPage.value}, append: ${append}`);
  try {
    const data = await $fetch('/api/qna', {
      params: {
        page: currentPage.value,
        itemsPerPage: itemsPerPage.value,
        ...searchParams.value
      }
    });
    // console.log('fetchQnAs: API response data:', data);

    if (append) {
      qnas.value = [...qnas.value, ...data.qnas];
    } else {
      qnas.value = data.qnas;
    }
    totalItems.value = data.total;
    noMoreData.value = qnas.value.length >= totalItems.value;
    // console.log(`fetchQnAs: Current QnAs count: ${qnas.value.length}, Total items: ${totalItems.value}, No more data: ${noMoreData.value}`);
  } catch (error) {
    console.error('Error fetching QnAs:', error)
  } finally {
    loading.value = false
  }
}

/**
 * @description 검색 바에서 검색 이벤트 발생 시 호출됩니다.
 * @param {object} params - 검색 파라미터 (type, text)
 */
const handleSearch = (params) => {
  searchParams.value = params
  currentPage.value = 1
  noMoreData.value = false // 검색 시 데이터가 새로 로드되므로 초기화
  if (!isMobile.value) {
  updateRouteQuery()
  } else {
    fetchQnAs() // 모바일에서는 즉시 fetch
  }
}

/**
 * @description 페이지 변경 이벤트 발생 시 호출됩니다 (데스크톱).
 * @param {number} page - 변경될 페이지 번호
 */
const handlePageChange = (page) => {
  currentPage.value = page
  updateRouteQuery()
}

/**
 * @description 페이지당 아이템 수 변경 이벤트 발생 시 호출됩니다 (데스크톱).
 * @param {number} newItemsPerPage - 변경될 페이지당 아이템 수
 */
const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage
  currentPage.value = 1
  updateRouteQuery()
}

/**
 * @description 라우트 쿼리 파라미터를 업데이트합니다 (데스크톱).
 */
const updateRouteQuery = () => {
  router.push({
    query: {
      ...searchParams.value,
      page: currentPage.value,
      itemsPerPage: itemsPerPage.value
    }
  })
}

/**
 * @description 모바일 환경에서 추가 데이터를 로드합니다.
 */
const loadMore = () => {
  if (isMobile.value && !loading.value && !noMoreData.value) {
    currentPage.value++;
    // console.log(`loadMore: Attempting to load more, new page: ${currentPage.value}`);
    fetchQnAs(true);
  } else {
    // console.log(`loadMore: Conditions not met. isMobile: ${isMobile.value}, loading: ${loading.value}, noMoreData: ${noMoreData.value}`);
  }
};

onMounted(() => {
  // onMounted에서는 isMobile.value가 true일 때만 Observer 설정 시도
  if (isMobile.value) {
    // infiniteScrollTrigger 요소가 DOM에 있을 때까지 기다린 후 Observer 설정
    watch(infiniteScrollTrigger, (newValue) => {
      if (newValue) {
        setupIntersectionObserver(true);
        if (qnas.value.length === 0) { // qnas가 비어있을 때만 초기 로딩
          fetchQnAs();
        }
      }
    }, { immediate: true });
  }
});

onUnmounted(() => {
  setupIntersectionObserver(false);
});

// isMobile 상태 변화를 감지하고, 그에 따라 로직을 조정합니다.
watch(isMobile, (newValue, oldValue) => {
  if (newValue === oldValue) return; // 같은 값으로의 변화는 무시

  // 모바일 <-> 데스크톱 전환 시 데이터 및 상태 초기화
  qnas.value = [];
  currentPage.value = 1;
  totalItems.value = 0;
  noMoreData.value = false;
  loading.value = false;

  setupIntersectionObserver(newValue); // isMobile 값에 따라 Observer 설정/해제

  if (newValue) { // 새로운 상태가 모바일이라면 초기 데이터 로드 (첫 페이지)
    // console.log('isMobile changed to true, setting up observer and fetching initial data.');
    // watch 훅에서 fetchQnAs 호출은 onMounted에서 이미 했다면 스킵
    if (qnas.value.length === 0) { // 비어있을 때만 다시 로드
      fetchQnAs();
    }
  } else { // 새로운 상태가 데스크톱이라면 URL 쿼리 파라미터 업데이트 및 초기 데이터 로드
    // console.log('isMobile changed to false, updating route query and fetching initial data.');
    updateRouteQuery();
    fetchQnAs();
  }
});

watchEffect(() => {
  if (!isMobile.value) {
    // 데스크톱 환경에서는 URL 쿼리 파라미터 기반 페이지네이션
  currentPage.value = parseInt(route.query.page) || 1
  itemsPerPage.value = parseInt(route.query.itemsPerPage) || 10
  searchParams.value = {
    type: route.query.type || '',
    text: route.query.text || ''
  }
    fetchQnAs(); // 데스크톱 환경에서만 watchEffect에 의한 fetchQnAs 호출
  }
});
</script>

<style scoped>
/* 필요한 스타일 추가 */
</style>