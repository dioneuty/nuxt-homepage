<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
        <Icon icon="mdi:help-circle" class="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
        질문과 답변
      </h1>
      
      <SearchBar 
        :board-type="'qna'"
        @search="handleSearch"
      />
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div class="bg-blue-100 dark:bg-blue-800 px-6 py-4">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
          <Icon icon="mdi:format-list-bulleted" class="w-5 h-5 mr-2" />
          질문 목록 (총 {{ totalItems }}개)
        </h2>
      </div>

      <div class="p-6">
        <div v-if="qnas.length === 0 && !loading" class="text-center py-8 text-gray-500 dark:text-gray-400">
          등록된 질문이 없습니다.
        </div>
        
        <div v-else class="space-y-4">
          <div 
            v-for="qna in qnas" 
            :key="qna.id"
            class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <nuxt-link 
                  :to="`/qna/view?id=${qna.id}`"
                  class="text-lg font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 block mb-2"
                >
                  {{ qna.questionTitle }}
                </nuxt-link>
                
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {{ qna.questionContent?.substring(0, 150) }}...
                </div>
                
                <div class="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4">
                  <span>작성자: {{ qna.author }}</span>
                  <span>작성일: {{ formatDate(qna.createdAt) }}</span>
                </div>
              </div>
              
              <div class="ml-4">
                <span 
                  :class="qna.answerContent ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ qna.answerContent ? '답변완료' : '답변대기' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 데스크톱 페이지네이션 -->
    <Pagination 
      v-if="!isMobile"
      :total-items="totalItems" 
      :items-per-page="itemsPerPage" 
      :current-page="currentPage"
      @page-change="handlePageChange"
      @items-per-page-change="handleItemsPerPageChange"
    />

    <!-- 모바일 무한 스크롤 로딩 -->
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

const setupIntersectionObserver = (enable) => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (enable && infiniteScrollTrigger.value) {
    observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && !loading.value && !noMoreData.value) {
        loadMore();
      }
    }, { rootMargin: '100px' });
    observer.observe(infiniteScrollTrigger.value);
  }
};

const fetchQnAs = async (append = false) => {
  if ((loading.value && append) || (append && noMoreData.value)) return;
  
  loading.value = true;
  try {
    const data = await $fetch('/api/qna', {
      params: {
        page: currentPage.value,
        itemsPerPage: itemsPerPage.value,
        ...searchParams.value
      }
    });

    qnas.value = append ? [...qnas.value, ...data.qnas] : data.qnas;
    totalItems.value = data.total;
    noMoreData.value = qnas.value.length >= totalItems.value;
  } catch (error) {
    console.error('Error fetching QnAs:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = (params) => {
  searchParams.value = params
  currentPage.value = 1
  noMoreData.value = false
  if (!isMobile.value) {
    updateRouteQuery()
  } else {
    fetchQnAs()
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  updateRouteQuery()
}

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage
  currentPage.value = 1
  updateRouteQuery()
}

const updateRouteQuery = () => {
  router.push({
    query: {
      ...searchParams.value,
      page: currentPage.value,
      itemsPerPage: itemsPerPage.value
    }
  })
}

const loadMore = () => {
  if (isMobile.value && !loading.value && !noMoreData.value) {
    currentPage.value++;
    fetchQnAs(true);
  }
};

onMounted(() => {
  if (isMobile.value) {
    watch(infiniteScrollTrigger, (newValue) => {
      if (newValue) {
        setupIntersectionObserver(true);
        if (qnas.value.length === 0) fetchQnAs();
      }
    }, { immediate: true });
  }
});

onUnmounted(() => setupIntersectionObserver(false));

// 모바일 <-> 데스크톱 전환 처리
watch(isMobile, (newValue, oldValue) => {
  if (newValue === oldValue) return;

  qnas.value = [];
  currentPage.value = 1;
  totalItems.value = 0;
  noMoreData.value = false;
  loading.value = false;

  setupIntersectionObserver(newValue);

  if (newValue) {
    if (qnas.value.length === 0) fetchQnAs();
  } else {
    updateRouteQuery();
    fetchQnAs();
  }
});

watchEffect(() => {
  if (!isMobile.value) {
    currentPage.value = parseInt(route.query.page) || 1
    itemsPerPage.value = parseInt(route.query.itemsPerPage) || 10
    searchParams.value = {
      type: route.query.type || '',
      text: route.query.text || ''
    }
    fetchQnAs();
  }
});
</script>

<style scoped>
/* 필요한 스타일 추가 */
</style>