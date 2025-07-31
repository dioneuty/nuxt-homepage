<template>
    <div class="mx-auto h-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold dark:text-white flex items-center">
          <Icon icon="mdi:youtube" class="mr-2" />
          유튜브 갤러리
        </h1>
        
        <!-- Admin Controls -->
        <div v-if="isAdmin" class="flex space-x-2">
          <button
            @click="openVideoModal()"
            class="btn-base bg-blue-600 hover:bg-blue-700"
          >
            <Icon icon="mdi:plus" class="mr-1" />
            비디오 추가
          </button>
          <button
            @click="toggleBulkMode"
            :class="[
              'btn-base',
              bulkState.mode 
                ? 'bg-orange-600 hover:bg-orange-700' 
                : 'bg-gray-600 hover:bg-gray-700'
            ]"
          >
            <Icon :icon="bulkState.mode ? 'mdi:close' : 'mdi:checkbox-multiple-marked'" class="mr-1" />
            {{ bulkState.mode ? '선택 취소' : '대량 선택' }}
          </button>
          <button
            @click="checkAllVideosPlayability"
            :disabled="isCheckingPlayability"
            class="btn-base bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400"
          >
            <Icon :icon="isCheckingPlayability ? 'mdi:loading' : 'mdi:play-circle-outline'" class="mr-1" :class="{ 'animate-spin': isCheckingPlayability }" />
            {{ isCheckingPlayability ? '확인 중...' : '재생가능 일괄확인' }}
          </button>
          <button
            @click="updateUploadDates"
            :disabled="isUpdatingUploadDates"
            class="btn-base bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
          >
            <Icon :icon="isUpdatingUploadDates ? 'mdi:loading' : 'mdi:calendar-upload'" class="mr-1" :class="{ 'animate-spin': isUpdatingUploadDates }" />
            {{ isUpdatingUploadDates ? '업데이트 중...' : '업로드일 일괄갱신' }}
          </button>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="flex flex-col lg:flex-row gap-4 mb-6">
        <!-- Category Filter -->
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            카테고리 필터
          </label>
          <div class="flex gap-2">
            <select 
              v-model="filterState.selectedCategoryId" 
              @change="onCategoryChange"
              :disabled="videoState.isLoading || categoryLoading"
              class="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="all">
                {{ categoryLoading ? '카테고리 로딩 중...' : `전체 카테고리 (${totalVideoCount || 0})` }}
              </option>
              <option 
                v-for="category in sortedCategories" 
                :key="category.id" 
                :value="category.slug === 'uncategorized' ? 'uncategorized' : category.id"
              >
                {{ category.name }} ({{ category.video_count || 0 }})
              </option>
            </select>
            <!-- Category Management Button -->
            <button
              v-if="isAdmin"
              @click="openCategoryManageModal"
              class="btn-icon-square bg-purple-600 hover:bg-purple-700 text-white"
              title="카테고리 관리"
            >
              <Icon icon="mdi:cog" class="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <!-- Search Filter -->
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            검색
          </label>
          <div class="relative">
            <input
              v-model="filterState.searchQuery"
              @input="onSearchChange"
              :disabled="videoState.isLoading"
              type="text"
              placeholder="비디오 검색..."
              class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            <Icon 
              icon="mdi:magnify" 
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        <!-- Sort Filter -->
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            정렬 기준
          </label>
          <div class="flex gap-2">
            <select 
              v-model="filterState.sortColumn" 
              @change="onSortChange"
              :disabled="videoState.isLoading"
              class="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="createdAt">등록일순</option>
              <option value="uploadedAt">업로드일순</option>
              <option value="title">제목순</option>
              <option value="updatedAt">수정일순</option>
              <option value="category">카테고리순</option>
              <option value="isPlayable">재생가능순</option>
            </select>
            <!-- Sort Order Toggle -->
            <button
              @click="toggleSortOrder"
              :disabled="videoState.isLoading"
              class="btn-icon-square bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white relative"
              :title="getSortOrderTooltip()"
            >
              <Icon 
                :icon="filterState.sortOrder === 'desc' ? 'mdi:sort-descending' : 'mdi:sort-ascending'" 
                class="w-5 h-5" 
              />
              <!-- Sort indicator badge -->
              <span class="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" 
                    v-if="filterState.sortColumn !== 'createdAt' || filterState.sortOrder !== 'desc'">
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Bulk Actions Toolbar -->
      <div v-if="bulkState.mode && isAdmin" class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div class="flex items-center gap-4">
            <span class="text-sm font-medium text-blue-700 dark:text-blue-300">
              {{ bulkState.selectedVideos.size }}개 비디오 선택됨
            </span>
            <div class="flex gap-2">
              <button
                @click="selectAllVideos"
                class="btn-sm-light bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-300"
              >
                전체 선택 ({{ videoState.videos.length }})
              </button>
              <button
                @click="selectUncategorized"
                class="btn-sm-light bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-800 dark:hover:bg-yellow-700 text-yellow-700 dark:text-yellow-300"
              >
                미분류 선택 ({{ uncategorizedCount }})
              </button>
              <button
                @click="selectUnplayable"
                class="btn-sm-light bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-700 dark:text-red-300"
              >
                재생불가 선택 ({{ unplayableCount }})
              </button>
              <button
                @click="clearSelectedVideos"
                class="btn-sm-light bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                선택 해제
              </button>
            </div>
          </div>
          
          <div class="flex gap-2">
            <div v-if="bulkState.selectedVideos.size === 0" class="text-sm text-gray-500 dark:text-gray-400 py-1 px-2">
              비디오를 선택하여 카테고리를 일괄 변경하세요
            </div>
            <template v-else>
            <select 
              v-model="bulkState.categoryId" 
              class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">카테고리 선택</option>
              <option value="uncategorized">미분류</option>
              <option 
                v-for="category in sortedCategories.filter(c => c.slug !== 'uncategorized')" 
                :key="category.id" 
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
            <button
              @click="applyBulkCategoryChange"
              :disabled="!bulkState.categoryId || bulkState.operationInProgress"
              class="btn-base bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
            >
              <Icon v-if="bulkState.operationInProgress" icon="mdi:loading" class="mr-1 animate-spin" />
              <Icon v-else icon="mdi:check" class="mr-1" />
              {{ bulkState.operationInProgress ? '적용 중...' : '카테고리 적용' }}
            </button>
            <button
              @click="bulkDeleteVideos"
              :disabled="bulkState.operationInProgress"
              class="btn-base bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
            >
              <Icon v-if="bulkState.operationInProgress" icon="mdi:loading" class="mr-1 animate-spin" />
              <Icon v-else icon="mdi:delete" class="mr-1" />
              {{ bulkState.operationInProgress ? '삭제 중...' : `선택된 ${bulkState.selectedVideos.size}개 삭제` }}
            </button>
            </template>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="videoState.isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600 dark:text-gray-300">비디오 목록을 불러오는 중...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="videoState.error" class="text-center py-12">
        <Icon icon="mdi:alert-circle" class="text-red-500 text-4xl mx-auto mb-4" />
        <p class="text-red-600 dark:text-red-400">비디오 목록을 불러오는데 실패했습니다.</p>
        <button
          @click="loadVideos"
          class="btn-base bg-blue-600 hover:bg-blue-700"
        >
          다시 시도
        </button>
      </div>

      <!-- Video Grid -->
      <div v-else class="masonry-layout">
        <div 
          v-for="video in videoState.videos" 
          :key="video.id" 
          class="masonry-item mb-4 break-inside-avoid relative"
          :ref="(el) => { if (el) videoRefs[video.videoId] = el }"
        >
          <div :class="[
            'bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-200 border-2',
            bulkState.mode && bulkState.selectedVideos.has(video.id) ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : '',
            bulkState.mode ? 'hover:ring-2 hover:ring-gray-400' : '',
            getCategoryColorClass(video.categoryId).border,
            getCategoryColorClass(video.categoryId).card
          ]">
            <!-- Bulk Selection Checkbox -->
            <div v-if="bulkState.mode && isAdmin" class="absolute top-2 left-2 z-10">
              <input
                type="checkbox"
                :checked="bulkState.selectedVideos.has(video.id)"
                @change="toggleVideoSelection(video.id)"
                class="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
            </div>
            
            <!-- Admin Controls for each video -->
            <div v-if="isAdmin && !bulkState.mode" class="bg-gray-100 dark:bg-gray-700 px-4 py-2 flex justify-end space-x-2">
              <button
                @click="openVideoModal(video)"
                class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                title="수정"
              >
                <Icon icon="mdi:pencil" class="text-sm" />
              </button>
              <button
                @click="handleVideoDelete(video)"
                class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                title="삭제"
              >
                <Icon icon="mdi:delete" class="text-sm" />
              </button>
            </div>

            <div 
              @click="bulkState.mode ? toggleVideoSelection(video.id) : loadVideo(video)" 
              :class="['cursor-pointer', bulkState.mode ? 'select-none' : '']"
            >
              <div v-if="video.loaded">
                <div class="relative">
                  <iframe 
                    :class="{ 'w-full min-h-[225px] h-auto aspect-[16/9]': !video.isShort, 'w-full h-auto aspect-[9/16]': video.isShort }"
                    :src="getEmbedUrl(video)"
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowfullscreen
                    referrerpolicy="strict-origin-when-cross-origin"
                    :title="`${video.title} - YouTube video player`"
                    @error="handleVideoError(video)"
                    @load="checkVideoPlayability(video)"
                  ></iframe>
                  <!-- 재생 실패 시 대체 링크 -->
                  <div v-if="video.hasError" class="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                    <div class="text-center text-white p-4">
                      <Icon icon="mdi:alert-circle" class="text-4xl mb-2" />
                      <p class="mb-3">비디오를 재생할 수 없습니다</p>
                      <a 
                        :href="`https://www.youtube.com/watch?v=${video.videoId}`" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="btn-base bg-red-600 hover:bg-red-700 inline-flex"
                      >
                        <Icon icon="mdi:youtube" class="mr-2" />
                        YouTube에서 보기
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else>
                <img
                    :src="`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`"
                    :alt="video.title"
                    :class="{'w-full min-h-[225px] h-auto aspect-[16/9] object-cover': !video.isShort, 'w-full h-auto aspect-[9/16] object-cover': video.isShort}"
                    loading="lazy"
                    @error="handleThumbnailError($event, video)"
                    crossorigin="anonymous"
                    />
              </div>
            </div>
            <div class="p-4">
              <h2 class="text-lg font-semibold mb-2 dark:text-white">{{ video.title }}</h2>
              <p class="text-sm text-gray-600 dark:text-gray-300">{{ video.description }}</p>
              
              <!-- Category Display -->
              <div v-if="video.YouTubeVideoCategory || !video.categoryId" class="flex items-center mt-2 mb-2">
                <span :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  getCategoryColorClass(video.categoryId).bg
                ]">
                  <Icon icon="mdi:tag" class="mr-1 w-3 h-3" />
                  {{ video.YouTubeVideoCategory ? video.YouTubeVideoCategory.name : '미분류' }}
                </span>
              </div>
              
              <!-- Upload Date and Thread Stats -->
              <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2 mb-3">
                <div class="flex items-center">
                  <Icon icon="mdi:comment-text-outline" class="mr-1" />
                  {{ getVideoThreadStats(video.videoId).totalThreads }} thread(s)
                </div>
                <div v-if="video.uploadedAt" class="flex items-center">
                  <Icon icon="mdi:calendar-upload" class="mr-1" />
                  {{ formatDate(video.uploadedAt) }}
                </div>
              </div>
              
              <!-- Video Controls -->
              <div class="flex justify-between gap-2 mb-3">
                <button class="video-control-btn bg-gray-500 hover:bg-gray-600 text-white" @click="unloadVideo(video)">썸네일</button>
                <button class="video-control-btn bg-gray-500 hover:bg-gray-600 text-white" @click="loadVideo(video)">플레이어</button>
                <button class="video-control-btn bg-gray-500 hover:bg-gray-600 text-white" @click="openModal(video)">모달</button>
                <button 
                  class="video-control-btn bg-purple-500 hover:bg-purple-600 text-white flex items-center" 
                  @click="openFloatingPlayer(video)"
                  title="PIP 모드로 재생"
                >
                  <Icon icon="mdi:picture-in-picture-bottom-right" class="w-3 h-3 mr-1" />
                  PIP
                </button>
              </div>
              
              <!-- Thread Controls -->
              <div class="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
                <button 
                  @click="openThreadEditor(video.videoId)"
                  class="thread-control-btn bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Icon icon="mdi:plus" class="mr-1" />
                  New Thread
                </button>
                <button 
                  @click="toggleThreads(video.videoId)"
                  class="thread-control-btn bg-green-500 hover:bg-green-600 text-white"
                >
                  <Icon icon="mdi:comment-text" class="mr-1" />
                  {{ showingThreads.has(video.videoId) ? 'Hide' : 'Show' }} Threads
                </button>
              </div>
              
              <!-- Thread Display -->
              <div v-if="showingThreads.has(video.videoId)" class="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <ThreadDisplay 
                  :videoId="video.videoId"
                  :threads="threads"
                  @edit-thread="openThreadEditor(video.videoId, $event)"
                  @delete-thread="handleDeleteThread"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Load More Button / Loading Indicator -->
      <div v-if="!videoState.isLoading && paginationState.hasMore" class="flex justify-center mt-8">
        <button
          @click="loadMoreVideos"
          :disabled="paginationState.isLoadingMore"
          class="btn-load-more bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white"
        >
          <Icon 
            v-if="paginationState.isLoadingMore" 
            icon="mdi:loading" 
            class="mr-2 animate-spin" 
          />
          <Icon 
            v-else 
            icon="mdi:chevron-down" 
            class="mr-2" 
          />
          {{ paginationState.isLoadingMore ? '로딩 중...' : '더 보기' }}
          <span class="ml-2 text-sm opacity-80">
            ({{ videoState.videos.length }} / {{ paginationState.totalItems }})
          </span>
        </button>
      </div>
      
      <!-- No More Items Message -->
      <div v-if="!videoState.isLoading && !paginationState.hasMore && videoState.videos.length > 0" class="text-center mt-8 text-gray-500 dark:text-gray-400">
        <Icon icon="mdi:check-circle" class="text-2xl mb-2" />
        <p>모든 비디오를 불러왔습니다.</p>
      </div>
    </div>
    
    <!-- Video Play Modal -->
    <PlayModal :youtubeVideoId="videoState.selectedVideo ? videoState.selectedVideo.videoId : ''" :isVisible="videoState.isModalOpen" @close="closeModal" />
    
    <!-- Video Management Modal -->
    <AdminYouTubeVideoWrite
      :isOpen="modalState.showVideoModal"
      :videoItem="modalState.selectedVideoForEdit"
      @close="closeVideoModal"
      @refresh="handleVideoRefresh"
    />
    
    <!-- Thread Editor Modal -->
    <div v-if="showThreadEditor" class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center" @click="closeThreadEditor">
      <div class="max-w-2xl w-full mx-4" @click.stop>
        <ThreadEditor 
          :videoId="selectedVideoForThread"
          :thread="editingThread"
          :isVisible="showThreadEditor"
          @close="closeThreadEditor"
          @submit="handleThreadSubmit"
        />
      </div>
    </div>
    
    <!-- Confirm Modal -->
    <ConfirmModal
      :isOpen="showConfirmModal"
      :title="confirmModalData.title"
      :message="confirmModalData.message"
      :type="confirmModalData.type"
      :confirmText="confirmModalData.confirmText"
      :cancelText="confirmModalData.cancelText"
      @confirm="handleConfirmModalConfirm"
      @cancel="handleConfirmModalCancel"
      @close="handleConfirmModalCancel"
    />
    
    <!-- Category Management Modal -->
    <CategoryManageModal
      :isOpen="modalState.showCategoryManageModal"
      @close="closeCategoryManageModal"
      @updated="handleCategoryUpdated"
    />
  </template>
  
  <script setup>
  import { ref, reactive, onMounted, onUnmounted, watch, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { Icon } from '@iconify/vue'
  import PlayModal from '@/components/youtubeGallery/PlayModal.vue'
  import ThreadEditor from '@/components/youtubeGallery/ThreadEditor.vue'
  import ThreadDisplay from '@/components/youtubeGallery/ThreadDisplay.vue'
  import AdminYouTubeVideoWrite from '@/components/admin/AdminYouTubeVideoWrite.vue'
  import ConfirmModal from '@/components/common/ConfirmModal.vue'
  import CategoryManageModal from '@/components/youtubeGallery/CategoryManageModal.vue'
  import useYoutubeGallery from '@/composables/useYoutubeGallery'
  import useVideoThreads from '@/composables/useVideoThreads'
  import { useAuth } from '@/composables/useAuth'
  import { useToast } from '@/composables/useToast'
  import { useYoutubeCategoryStore } from '@/stores/youtubeCategoryStore'
  import { useFloatingPlayerStore } from '@/stores/floatingPlayer'
  import { storeToRefs } from 'pinia' // Pinia에서 storeToRefs를 가져옵니다.

  const { isAdmin } = useAuth()
  const { showToast } = useToast()
  const route = useRoute()
  const router = useRouter()
  
  // Floating player store
  const floatingPlayerStore = useFloatingPlayerStore()

  // Category store integration
  const youtubeCategoryStore = useYoutubeCategoryStore()
  const {
    categories,
    sortedCategories,
    totalVideoCount,
    loading: categoryLoading,
    error: categoryError
  } = storeToRefs(youtubeCategoryStore)

  const {
    fetchCategories,
    setActiveCategory,
    recalculateVideoCounts
  } = youtubeCategoryStore

  // Grouped state management for better organization
  const videoState = reactive({
    videos: [],
    isLoading: true,
    error: null,
    selectedVideo: null,
    isModalOpen: false
  })

  // Load user preferences from localStorage
  const loadUserPreferences = () => {
    if (process.client) {
      const saved = localStorage.getItem('youtube-gallery-sort-preferences')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.warn('Failed to parse sort preferences:', e)
        }
      }
    }
    return { sortColumn: 'createdAt', sortOrder: 'desc' }
  }

  const userPreferences = loadUserPreferences()

  // Filter states grouped
  const filterState = reactive({
    selectedCategoryId: route.query.category || 'all',
    searchQuery: route.query.search || '',
    searchTimeout: null,
    sortColumn: route.query.sortColumn || userPreferences.sortColumn,
    sortOrder: route.query.sortOrder || userPreferences.sortOrder
  })

  // Bulk operation states grouped
  const bulkState = reactive({
    mode: false,
    selectedVideos: new Set(),
    categoryId: '',
    operationInProgress: false
  })

  // Modal states grouped
  const modalState = reactive({
    showVideoModal: false,
    selectedVideoForEdit: null,
    showCategoryManageModal: false
  })

  // Single operation states
  const isCheckingPlayability = ref(false)
  const isUpdatingUploadDates = ref(false)
  
  // Pagination states
  const paginationState = reactive({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
    hasMore: true,
    isLoadingMore: false
  })
  
  // Confirm modal states
  const showConfirmModal = ref(false)
  const confirmModalData = ref({
    title: '',
    message: '',
    type: 'info',
    confirmText: '확인',
    cancelText: '취소',
    onConfirm: null
  })
  
  // Thread management
  const {
    threads,
    isLoading: threadsLoading,
    error: threadsError,
    getThreadsForVideo,
    createThread,
    updateThread,
    deleteThread,
    getVideoThreadStats
  } = useVideoThreads()
  
  const showThreadEditor = ref(false)
  const selectedVideoForThread = ref(null)
  const editingThread = ref(null)
  const showingThreads = ref(new Set())

  const { getEmbedUrl, loadVideo, unloadVideo } = useYoutubeGallery(videoState.videos)
  
  const videoRefs = ref({})

  // 카테고리별 색상 시스템
  const getCategoryColorClass = (categoryId) => {
    // 카테고리가 없는 경우
    if (!categoryId) {
      return {
        bg: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
        border: 'border-gray-300 dark:border-gray-700',
        card: ''
      }
    }

    // 카테고리 정보 찾기
    const category = categories.value.find(c => c.id === categoryId)
    const categoryIndex = categories.value.findIndex(c => c.id === categoryId)
    
    // 미리 정의된 색상 팔레트 (10가지 색상)
    const colors = [
      { // Blue
        bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        border: 'border-blue-300 dark:border-blue-700',
        card: 'hover:bg-blue-50 dark:hover:bg-blue-950/20'
      },
      { // Green
        bg: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        border: 'border-green-300 dark:border-green-700',
        card: 'hover:bg-green-50 dark:hover:bg-green-950/20'
      },
      { // Purple
        bg: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        border: 'border-purple-300 dark:border-purple-700',
        card: 'hover:bg-purple-50 dark:hover:bg-purple-950/20'
      },
      { // Yellow
        bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        border: 'border-yellow-300 dark:border-yellow-700',
        card: 'hover:bg-yellow-50 dark:hover:bg-yellow-950/20'
      },
      { // Red
        bg: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        border: 'border-red-300 dark:border-red-700',
        card: 'hover:bg-red-50 dark:hover:bg-red-950/20'
      },
      { // Indigo
        bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
        border: 'border-indigo-300 dark:border-indigo-700',
        card: 'hover:bg-indigo-50 dark:hover:bg-indigo-950/20'
      },
      { // Pink
        bg: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
        border: 'border-pink-300 dark:border-pink-700',
        card: 'hover:bg-pink-50 dark:hover:bg-pink-950/20'
      },
      { // Orange
        bg: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        border: 'border-orange-300 dark:border-orange-700',
        card: 'hover:bg-orange-50 dark:hover:bg-orange-950/20'
      },
      { // Teal
        bg: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
        border: 'border-teal-300 dark:border-teal-700',
        card: 'hover:bg-teal-50 dark:hover:bg-teal-950/20'
      },
      { // Cyan
        bg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
        border: 'border-cyan-300 dark:border-cyan-700',
        card: 'hover:bg-cyan-50 dark:hover:bg-cyan-950/20'
      }
    ]

    // categoryIndex를 색상 배열 길이로 나눈 나머지로 색상 선택
    const colorIndex = Math.abs(categoryIndex) % colors.length
    return colors[colorIndex]
  }

  // Confirm modal helper function
  const showConfirm = (options) => {
    return new Promise((resolve) => {
      confirmModalData.value = {
        title: options.title || '확인',
        message: options.message,
        type: options.type || 'info',
        confirmText: options.confirmText || '확인',
        cancelText: options.cancelText || '취소',
        onConfirm: () => resolve(true)
      }
      showConfirmModal.value = true
    })
  }

  const handleConfirmModalCancel = () => {
    showConfirmModal.value = false
    // Promise는 자동으로 pending 상태로 남아있게 됨 (사용자가 취소한 경우)
  }

  const handleConfirmModalConfirm = () => {
    showConfirmModal.value = false
    if (confirmModalData.value.onConfirm) {
      confirmModalData.value.onConfirm()
    }
  }

  // Computed properties for counting specific video types
  const uncategorizedCount = computed(() => {
    return videoState.videos.filter(video => !video.categoryId).length
  })

  const unplayableCount = computed(() => {
    const unplayableVideos = videoState.videos.filter(video => 
      video.hasError || (video.isPlayable !== undefined && video.isPlayable === false)
    )
    return unplayableVideos.length
  })

  /**
   * 서버에서 YouTube 비디오 목록을 로드합니다.
   */
  const loadVideos = async () => {
    try {
      videoState.isLoading = true
      videoState.error = null
      
      // Build query parameters
      const queryParams = {
        page: paginationState.currentPage,
        limit: paginationState.itemsPerPage
      }

      // Add category filter
      if (filterState.selectedCategoryId && filterState.selectedCategoryId !== 'all') {
        queryParams.categoryId = filterState.selectedCategoryId
      }

      // Add search filter
      if (filterState.searchQuery.trim()) {
        queryParams.searchText = filterState.searchQuery.trim()
        queryParams.searchType = 'title' // Search in title by default
      }

      // Add sort parameters
      queryParams.sortColumn = filterState.sortColumn
      queryParams.sortOrder = filterState.sortOrder
      
      const response = await $fetch('/api/youtube-gallery', {
        method: 'GET',
        query: queryParams
      })
      
      // API 응답을 기존 videos 형태로 변환
      const newVideos = response.items.map(item => ({
        id: item.id,
        videoId: item.videoId,
        title: item.title,
        description: item.description,
        isShort: item.isShort,
        isPlayable: item.isPlayable !== undefined ? item.isPlayable : true, // 기본값 true
        uploadedAt: item.uploadedAt,
        categoryId: item.categoryId,
        YouTubeVideoCategory: item.YouTubeVideoCategory, // API 응답의 올바른 카테고리 필드
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        loaded: false,
        hasError: false
      }))
      
      // 첫 페이지인 경우 새로 설정, 아니면 추가
      if (paginationState.currentPage === 1) {
        videoState.videos = newVideos
      } else {
        videoState.videos.push(...newVideos)
      }
      
      // 페이지네이션 상태 업데이트
      paginationState.totalPages = response.totalPages
      paginationState.totalItems = response.total
      paginationState.hasMore = paginationState.currentPage < response.totalPages

      // 카테고리 비디오 수는 API에서 가져온 값을 유지
      // recalculateVideoCounts는 필터링된 결과에 영향을 주지 않도록 제거
      
    } catch (err) {
      console.error('비디오 목록 로드 실패:', err)
      videoState.error = err.message || '비디오 목록을 불러오는데 실패했습니다.'
    } finally {
      videoState.isLoading = false
    }
  }

  /**
   * 더 많은 비디오를 로드합니다 (무한 스크롤용)
   */
  const loadMoreVideos = async () => {
    if (!paginationState.hasMore || paginationState.isLoadingMore || videoState.isLoading) {
      return
    }
    
    try {
      paginationState.isLoadingMore = true
      paginationState.currentPage++
      await loadVideos()
    } catch (error) {
      // 오류 발생 시 페이지 번호 되돌리기
      paginationState.currentPage--
      console.error('추가 비디오 로드 실패:', error)
    } finally {
      paginationState.isLoadingMore = false
    }
  }
  
  /**
   * 비디오 관리 모달을 엽니다.
   */
  const openVideoModal = (video = null) => {
    modalState.selectedVideoForEdit = video
    modalState.showVideoModal = true
  }

  /**
   * 비디오 관리 모달을 닫습니다.
   */
  const closeVideoModal = () => {
    modalState.showVideoModal = false
    modalState.selectedVideoForEdit = null
  }

  /**
   * 카테고리 관리 모달을 엽니다.
   */
  const openCategoryManageModal = () => {
    modalState.showCategoryManageModal = true
  }

  /**
   * 카테고리 관리 모달을 닫습니다.
   */
  const closeCategoryManageModal = () => {
    modalState.showCategoryManageModal = false
  }

  /**
   * 카테고리 관리 모달에서 업데이트가 발생했을 때 처리합니다.
   */
  const handleCategoryUpdated = async () => {
    // 카테고리 목록과 비디오 목록 새로고침
    await recalculateVideoCounts()
    await loadVideos()
  }

  /**
   * 비디오 목록을 새로고침합니다.
   */
  const handleVideoRefresh = async () => {
    // 비디오 추가/수정 후 카테고리 수 재계산
    await recalculateVideoCounts()
    await loadVideos()
  }

  /**
   * 비디오를 삭제합니다.
   */
  const handleVideoDelete = async (video) => {
    if (!isAdmin.value) {
      showToast('관리자 권한이 필요합니다.', 'error')
      return
    }

    try {
      const confirmed = await showConfirm({
        title: '비디오 삭제',
        message: `"${video.title}" 비디오를 삭제하시겠습니까?`,
        type: 'danger',
        confirmText: '삭제',
        cancelText: '취소'
      })

      if (!confirmed) return

      await $fetch(`/api/admin/youtube-gallery/${video.id}`, {
        method: 'DELETE'
      })
      
      showToast('비디오가 성공적으로 삭제되었습니다.', 'success')
      // 비디오 삭제 후 카테고리 수 재계산
      await recalculateVideoCounts()
      await loadVideos()
    } catch (err) {
      console.error('비디오 삭제 실패:', err)
      error.value = err.message || '비디오 삭제에 실패했습니다.'
    }
  }
  
  // 간소화된 핸들러들
  const openThreadEditor = (videoId, thread = null) => {
    Object.assign({ selectedVideoForThread, editingThread, showThreadEditor }, 
      { selectedVideoForThread: videoId, editingThread: thread, showThreadEditor: true })
  }

  const closeThreadEditor = () => {
    Object.assign({ selectedVideoForThread, editingThread, showThreadEditor }, 
      { selectedVideoForThread: null, editingThread: null, showThreadEditor: false })
  }

  const handleThreadSubmit = async (threadData) => {
    try {
      editingThread.value 
        ? await updateThread(editingThread.value.id, threadData)
        : await createThread(threadData)
      closeThreadEditor()
    } catch (error) {
      console.error('Thread error:', error)
    }
  }

  const handleDeleteThread = async (threadId) => {
    try { await deleteThread(threadId) } catch (e) { console.error('Delete error:', e) }
  }

  const toggleThreads = (videoId) => {
    showingThreads.value.has(videoId) 
      ? showingThreads.value.delete(videoId)
      : showingThreads.value.add(videoId)
  }
  
  /**
   * 비디오 재생 에러 발생 시 처리 함수
   * 관리자인 경우 자동으로 isPlayable을 false로 업데이트
   */
  const handleVideoError = async (video) => {
    video.hasError = true
    
    // 관리자인 경우에만 자동 업데이트
    if (isAdmin.value) {
      try {
        // 이미 isPlayable이 false인 경우 중복 요청 방지
        if (video.isPlayable === false) {
          return
        }
        
        // 데이터베이스에서 isPlayable을 false로 업데이트
        await $fetch(`/api/admin/youtube-gallery/${video.id}`, {
          method: 'PUT',
          body: {
            url: `https://www.youtube.com/watch?v=${video.videoId}`,
            title: video.title,
            description: video.description || '',
            isShort: video.isShort || false,
            isPlayable: false, // 자동으로 false로 설정
            categoryId: video.categoryId || null,
          },
        })
        
        // 로컬 상태도 업데이트
        video.isPlayable = false
        
        showToast(`"${video.title}" 비디오가 재생불가로 자동 표시되었습니다.`, 'info')
        
      } catch (error) {
        console.error('비디오 재생불가 자동 업데이트 실패:', error)
        showToast(`자동 업데이트 실패: ${error.message}`, 'error')
      }
    }
  }

  /**
   * 썸네일 이미지 로드 실패 시 대체 이미지로 변경하는 함수
   */
  const handleThumbnailError = (event, video) => {
    const img = event.target
    
    // 이미 처리 중이면 무시
    if (img.dataset.processing === 'true') return
    img.dataset.processing = 'true'
    
    // 시도한 횟수 추적
    const attemptCount = parseInt(img.dataset.attemptCount || '0')
    img.dataset.attemptCount = String(attemptCount + 1)
    
    // fallback URL 목록 (hqdefault부터 시작)
    const fallbackUrls = [
      `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`,
      `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`, 
      `https://img.youtube.com/vi/${video.videoId}/default.jpg`,
      `https://i.ytimg.com/vi/${video.videoId}/default.jpg`, // 대체 도메인
      `https://via.placeholder.com/480x360/374151/ffffff?text=${encodeURIComponent(video.title ? video.title.substring(0, 20) + '...' : 'Video')}`
    ]
    
    // 다음 URL 시도
    if (attemptCount < fallbackUrls.length) {
      // 약간의 지연 후 시도 (네트워크 안정성)
      setTimeout(() => {
        img.src = fallbackUrls[attemptCount]
        img.dataset.processing = 'false'
      }, 100)
    } else {
      // 모든 시도 실패 시 이벤트 제거
      img.removeEventListener('error', handleThumbnailError)
      console.warn(`모든 썸네일 URL 실패: ${video.title}`)
    }
  }

  /**
   * iframe 로드 후 비디오 재생 가능성을 체크하는 함수
   * YouTube는 iframe 에러 이벤트가 정확하지 않으므로 추가 체크
   */
  const checkVideoPlayability = (video) => {
    // 이미 에러로 표시된 경우 중복 체크 방지
    if (video.hasError) {
      return
    }
    
    // 3초 후에 재생 가능성 체크 (YouTube iframe 로딩 대기)
    setTimeout(() => {
      // 만약 이미 에러가 표시되었다면 처리하지 않음
      if (video.hasError) {
        return
      }
      
      // YouTube API 또는 기타 체크 로직을 여기에 추가할 수 있음
      // 현재는 단순히 특정 패턴의 videoId에 대해 체크
      
      // 예: 삭제된 비디오나 비공개 비디오의 일반적인 패턴 체크
      const problematicPatterns = [
        // 추후 확장 가능한 패턴들
      ]
      
      // 실제 구현에서는 YouTube Data API를 사용하거나
      // iframe 내부 DOM을 체크하는 로직을 추가할 수 있음
      
    }, 3000)
  }

  /**
   * 모든 비디오의 재생 가능성을 일괄 확인하는 함수
   * 관리자만 사용 가능
   */
  const checkAllVideosPlayability = async () => {
    if (!isAdmin.value || isCheckingPlayability.value) {
      return
    }

    try {
      const confirmed = await showConfirm({
        title: '재생가능성 확인',
        message: `현재 표시된 ${videoState.videos.length}개 비디오의 재생 가능성을 확인하시겠습니까?\n재생불가 비디오는 자동으로 표시됩니다.`,
        type: 'warning',
        confirmText: '확인 시작',
        cancelText: '취소'
      })

      if (!confirmed) return
    } catch (err) {
      return
    }

    isCheckingPlayability.value = true
    let checkedCount = 0
    let updatedCount = 0

    try {
      showToast('비디오 재생 가능성 확인을 시작합니다...', 'info')

      // 순차적으로 각 비디오 확인 (동시 요청으로 인한 부하 방지)
      for (const video of videoState.videos) {
        try {
          // 이미 재생불가로 표시된 비디오는 건너뛰기
          if (!video.isPlayable) {
            checkedCount++
            continue
          }

          // YouTube oEmbed API를 사용하여 비디오 상태 확인
          const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${video.videoId}&format=json`
          
          try {
            const response = await fetch(oembedUrl)
            
            if (!response.ok) {
              // oEmbed API에서 404 또는 기타 에러 발생 시 재생불가로 간주
              await updateVideoPlayability(video, false)
              updatedCount++
            }
          } catch (fetchError) {
            // 네트워크 에러 등으로 확인 불가능한 경우 건너뛰기
          }

          checkedCount++
          
          // API 요청 간격 조절 (YouTube API 제한 고려)
          await new Promise(resolve => setTimeout(resolve, 200))
          
        } catch (error) {
          console.error(`비디오 확인 중 오류: ${video.title}`, error)
          checkedCount++
        }
      }

      showToast(`재생 가능성 확인 완료: ${checkedCount}개 확인, ${updatedCount}개 업데이트`, 'success')
      
      if (updatedCount > 0) {
        // 업데이트된 비디오가 있으면 목록 새로고침
        await loadVideos()
      }

    } catch (error) {
      console.error('일괄 재생가능성 확인 실패:', error)
      showToast('재생 가능성 확인 중 오류가 발생했습니다.', 'error')
    } finally {
      isCheckingPlayability.value = false
    }
  }

  /**
   * 개별 비디오의 재생 가능성을 업데이트하는 헬퍼 함수
   */
  const updateVideoPlayability = async (video, isPlayable) => {
    try {
      await $fetch(`/api/admin/youtube-gallery/${video.id}`, {
        method: 'PUT',
        body: {
          url: `https://www.youtube.com/watch?v=${video.videoId}`,
          title: video.title,
          description: video.description || '',
          isShort: video.isShort || false,
          isPlayable: isPlayable,
          categoryId: video.categoryId || null,
        },
      })

      // 로컬 상태 업데이트
      video.isPlayable = isPlayable
      if (!isPlayable) {
        video.hasError = true
      }

    } catch (error) {
      console.error(`비디오 재생가능성 업데이트 실패: ${video.title}`, error)
      throw error
    }
  }


  const openModal = (video) => { videoState.selectedVideo = video; videoState.isModalOpen = true }
  const closeModal = () => { videoState.isModalOpen = false; videoState.selectedVideo = null }
  const updateVideoTime = (time) => { if (videoState.selectedVideo) videoState.selectedVideo.currentTime = time }
  
  /**
   * PIP 모드로 비디오를 여는 함수
   */
  const openFloatingPlayer = (video) => {
    floatingPlayerStore.openVideo(video.videoId, video.title)
    showToast(`"${video.title}" PIP 모드로 재생 시작`, 'success')
  }

  /**
   * 카테고리 변경 시 호출되는 함수
   */
  const onCategoryChange = () => {
    // Update URL with new category
    const query = { ...route.query }
    
    if (filterState.selectedCategoryId === 'all') {
      delete query.category
    } else {
      query.category = filterState.selectedCategoryId
    }

    router.push({ query })
    setActiveCategory(filterState.selectedCategoryId)
    // 카테고리 변경 시 첫 페이지부터 다시 로드
    paginationState.currentPage = 1
    loadVideos()
  }

  /**
   * 검색어 변경 시 호출되는 함수 (디바운스 적용)
   */
  const onSearchChange = () => {
    // Clear existing timeout
    if (filterState.searchTimeout) {
      clearTimeout(filterState.searchTimeout)
    }

    // Set new timeout for debounced search
    filterState.searchTimeout = setTimeout(() => {
      const query = { ...route.query }
      
      if (filterState.searchQuery.trim()) {
        query.search = filterState.searchQuery.trim()
      } else {
        delete query.search
      }

      router.push({ query })
      // 검색어 변경 시 첫 페이지부터 다시 로드
      paginationState.currentPage = 1
      loadVideos()
    }, 300) // 300ms debounce delay
  }

  /**
   * 사용자 정렬 선호도 저장 함수
   */
  const saveUserPreferences = () => {
    if (process.client) {
      const preferences = {
        sortColumn: filterState.sortColumn,
        sortOrder: filterState.sortOrder
      }
      localStorage.setItem('youtube-gallery-sort-preferences', JSON.stringify(preferences))
    }
  }

  /**
   * 정렬 기준 변경 시 호출되는 함수
   */
  const onSortChange = () => {
    // Update URL with new sort parameters
    const query = { ...route.query }
    
    query.sortColumn = filterState.sortColumn
    query.sortOrder = filterState.sortOrder

    // Save user preferences
    saveUserPreferences()

    router.push({ query })
    // 정렬 변경 시 첫 페이지부터 다시 로드
    paginationState.currentPage = 1
    loadVideos()
  }

  /**
   * 정렬 순서 토글 함수 (오름차순 ↔ 내림차순)
   */
  const toggleSortOrder = () => {
    filterState.sortOrder = filterState.sortOrder === 'desc' ? 'asc' : 'desc'
    onSortChange()
  }

  /**
   * 정렬 순서 툴팁 텍스트 생성 함수
   */
  const getSortOrderTooltip = () => {
    const columnNames = {
      'createdAt': '등록일',
      'uploadedAt': '업로드일',
      'title': '제목',
      'updatedAt': '수정일',
      'category': '카테고리',
      'isPlayable': '재생가능'
    }
    
    const columnName = columnNames[filterState.sortColumn] || '알 수 없음'
    const orderText = filterState.sortOrder === 'desc' ? '내림차순' : '오름차순'
    
    return `${columnName} ${orderText} 정렬 (클릭하여 ${filterState.sortOrder === 'desc' ? '오름차순' : '내림차순'}으로 변경)`
  }

  /**
   * 업로드 일을 일괄 업데이트하는 함수
   */
  const updateUploadDates = async () => {
    if (!isAdmin.value || isUpdatingUploadDates.value) {
      return
    }

    try {
      const confirmed = await showConfirm({
        title: '업로드일 일괄 갱신',
        message: 'YouTube API를 사용하여 업로드 일이 없는 비디오들의 업로드 일을 자동으로 가져와서 업데이트하시겠습니까?\n\n주의: YouTube API 키가 필요하며, 많은 비디오가 있을 경우 시간이 걸릴 수 있습니다.',
        type: 'warning',
        confirmText: '업데이트 시작',
        cancelText: '취소'
      })

      if (!confirmed) return
    } catch (err) {
      return
    }

    isUpdatingUploadDates.value = true

    try {
      showToast('업로드 일 업데이트를 시작합니다...', 'info')

      const response = await $fetch('/api/admin/youtube-gallery/update-upload-dates', {
        method: 'POST'
      })

      if (response.success) {
        showToast(response.message, 'success')
        
        if (response.failedCount > 0) {
          console.warn('일부 비디오 업데이트 실패:', response.failedVideos)
          showToast(`${response.failedCount}개 비디오 업데이트 실패. 콘솔을 확인하세요.`, 'warning')
        }

        // 비디오 목록 새로고침
        await loadVideos()
      } else {
        showToast('업로드 일 업데이트에 실패했습니다.', 'error')
      }

    } catch (error) {
      console.error('업로드 일 업데이트 실패:', error)
      
      if (error.message.includes('YouTube API')) {
        showToast('YouTube API 키가 설정되지 않았거나 유효하지 않습니다. 환경 설정을 확인하세요.', 'error')
      } else {
        showToast('업로드 일 업데이트 중 오류가 발생했습니다.', 'error')
      }
    } finally {
      isUpdatingUploadDates.value = false
    }
  }

  /**
   * 대량 선택 모드를 토글합니다.
   */
  const toggleBulkMode = () => {
    bulkState.mode = !bulkState.mode
    if (!bulkState.mode) {
      clearSelectedVideos()
    }
  }

  /**
   * 비디오 선택 상태를 토글합니다.
   */
  const toggleVideoSelection = (videoId) => {
    if (bulkState.selectedVideos.has(videoId)) {
      bulkState.selectedVideos.delete(videoId)
    } else {
      bulkState.selectedVideos.add(videoId)
    }
    // Vue의 반응성을 위해 새로운 Set으로 교체
    bulkState.selectedVideos = new Set(bulkState.selectedVideos)
  }

  /**
   * 현재 페이지의 모든 비디오를 선택합니다.
   */
  const selectAllVideos = () => {
    videoState.videos.forEach(video => {
      bulkState.selectedVideos.add(video.id)
    })
    bulkState.selectedVideos = new Set(bulkState.selectedVideos)
  }

  /**
   * 모든 선택을 해제합니다.
   */
  const clearSelectedVideos = () => {
    bulkState.selectedVideos.clear()
    bulkState.selectedVideos = new Set(bulkState.selectedVideos)
    bulkState.categoryId = ''
  }

  /**
   * 날짜를 포맷팅하는 함수
   */
  const formatDate = (dateString) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    
    // 7일 이내면 상대적 시간 표시
    if (diffInDays === 0) {
      return '오늘'
    } else if (diffInDays === 1) {
      return '어제'
    } else if (diffInDays < 7) {
      return `${diffInDays}일 전`
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7)
      return `${weeks}주 전`
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30)
      return `${months}개월 전`
    } else {
      const years = Math.floor(diffInDays / 365)
      return `${years}년 전`
    }
  }

  /**
   * 카테고리가 없는 미분류 비디오들을 선택합니다.
   */
  const selectUncategorized = () => {
    const uncategorizedIds = videoState.videos
      .filter(video => !video.categoryId)
      .map(video => video.id)
    
    uncategorizedIds.forEach(id => bulkState.selectedVideos.add(id))
    bulkState.selectedVideos = new Set(bulkState.selectedVideos)
  }

  /**
   * 재생할 수 없는 비디오들을 선택합니다.
   */
  const selectUnplayable = () => {
    const unplayableIds = videoState.videos
      .filter(video => 
        video.hasError || (video.isPlayable !== undefined && video.isPlayable === false)
      )
      .map(video => video.id)
    
    unplayableIds.forEach(id => bulkState.selectedVideos.add(id))
    bulkState.selectedVideos = new Set(bulkState.selectedVideos)
  }

  /**
   * 선택된 비디오들에 카테고리를 일괄 적용합니다.
   */
  const applyBulkCategoryChange = async () => {
    if (!bulkState.categoryId || bulkState.selectedVideos.size === 0) {
      showToast('카테고리와 비디오를 선택해주세요.', 'warning')
      return
    }

    try {
      const confirmed = await showConfirm({
        title: '카테고리 변경',
        message: `선택된 ${bulkState.selectedVideos.size}개 비디오의 카테고리를 변경하시겠습니까?`,
        type: 'warning',
        confirmText: '변경',
        cancelText: '취소'
      })

      if (!confirmed) return
    } catch (err) {
      return
    }

    try {
      bulkState.operationInProgress = true

      const categoryId = bulkState.categoryId === 'uncategorized' ? null : bulkState.categoryId
      const videoIds = Array.from(bulkState.selectedVideos)

      const response = await $fetch('/api/admin/youtube-gallery/bulk-update', {
        method: 'POST',
        body: {
          videoIds,
          categoryId
        }
      })

      showToast(`${response.updatedCount}개 비디오의 카테고리가 성공적으로 변경되었습니다.`, 'success')
      
      // 상태 초기화 및 데이터 새로고침
      clearSelectedVideos()
      await recalculateVideoCounts()
      await loadVideos()
      
    } catch (err) {
      console.error('대량 카테고리 변경 실패:', err)
      showToast('카테고리 변경에 실패했습니다.', 'error')
    } finally {
      bulkState.operationInProgress = false
    }
  }

  /**
   * 선택된 비디오들을 일괄 삭제합니다.
   */
  const bulkDeleteVideos = async () => {
    if (bulkState.selectedVideos.size === 0) {
      showToast('삭제할 비디오를 선택해주세요.', 'warning')
      return
    }

    const selectedVideoTitles = videoState.videos
      .filter(video => bulkState.selectedVideos.has(video.id))
      .map(video => video.title)
      .slice(0, 3) // 처음 3개만 표시

    const titlePreview = selectedVideoTitles.join(', ')
    const moreCount = bulkState.selectedVideos.size - selectedVideoTitles.length
    const previewText = moreCount > 0 
      ? `${titlePreview} 외 ${moreCount}개`
      : titlePreview

    try {
      const confirmed = await showConfirm({
        title: '비디오 대량 삭제',
        message: `선택된 ${bulkState.selectedVideos.size}개 비디오를 삭제하시겠습니까?\n\n삭제할 비디오:\n${previewText}\n\n이 작업은 되돌릴 수 없습니다.`,
        type: 'danger',
        confirmText: '삭제',
        cancelText: '취소'
      })

      if (!confirmed) return
    } catch (err) {
      return
    }

    try {
      bulkState.operationInProgress = true
      const videoIds = Array.from(bulkState.selectedVideos)
      let deletedCount = 0
      let failedCount = 0

      showToast(`${videoIds.length}개 비디오 삭제를 시작합니다...`, 'info')

      // 순차적으로 삭제 (API 서버 부하 고려)
      for (const videoId of videoIds) {
        try {
          await $fetch(`/api/admin/youtube-gallery/${videoId}`, {
            method: 'DELETE'
          })
          deletedCount++
        } catch (error) {
          console.error(`비디오 삭제 실패 (ID: ${videoId}):`, error)
          failedCount++
        }
      }

      // 결과 알림
      if (failedCount === 0) {
        showToast(`${deletedCount}개 비디오가 성공적으로 삭제되었습니다.`, 'success')
      } else {
        showToast(`${deletedCount}개 삭제 성공, ${failedCount}개 실패`, 'warning')
      }
      
      // 상태 초기화 및 데이터 새로고침
      clearSelectedVideos()
      await recalculateVideoCounts()
      await loadVideos()
      
    } catch (err) {
      console.error('대량 삭제 실패:', err)
      showToast('비디오 삭제에 실패했습니다.', 'error')
    } finally {
      bulkState.operationInProgress = false
    }
  }

  // Watch for URL parameter changes
  watch(() => route.query.category, (newCategory) => {
    filterState.selectedCategoryId = newCategory || 'all'
    // 카테고리 변경 시 선택된 비디오 초기화
    if (bulkState.mode) {
      clearSelectedVideos()
    }
    if (categories.value.length > 0) {
      paginationState.currentPage = 1
      loadVideos()
    }
  })

  watch(() => route.query.search, (newSearch) => {
    filterState.searchQuery = newSearch || ''
    // 검색어 변경 시 선택된 비디오 초기화
    if (bulkState.mode) {
      clearSelectedVideos()
    }
    if (categories.value.length > 0) {
      paginationState.currentPage = 1
      loadVideos()
    }
  })

  // 정렬 파라미터 변경 감지
  watch(() => route.query.sortColumn, (newSortColumn) => {
    filterState.sortColumn = newSortColumn || 'createdAt'
    if (categories.value.length > 0) {
      paginationState.currentPage = 1
      loadVideos()
    }
  })

  watch(() => route.query.sortOrder, (newSortOrder) => {
    filterState.sortOrder = newSortOrder || 'desc'
    if (categories.value.length > 0) {
      paginationState.currentPage = 1
      loadVideos()
    }
  })

  // 비디오 목록 변경 시 선택된 비디오 검증
  watch(() => videoState.videos, (newVideos) => {
    if (bulkState.mode && bulkState.selectedVideos.size > 0) {
      const currentVideoIds = new Set(newVideos.map(v => v.id))
      const validSelectedVideos = new Set()
      
      bulkState.selectedVideos.forEach(videoId => {
        if (currentVideoIds.has(videoId)) {
          validSelectedVideos.add(videoId)
        }
      })
      
      bulkState.selectedVideos = validSelectedVideos
    }
  })

  // Future enhancement: 유튜브 갤러리 크게 보기 화면 구현 
  // Enhanced video player modal with fullscreen support and improved UX
  
  onMounted(async () => {
    try {
      // Load categories first - 항상 최신 데이터를 가져오도록 강제 호출
      
      // 카테고리 데이터를 강제로 다시 불러와서 최신 비디오 수 반영
      await fetchCategories();

      // Set active category from URL or default to 'all'
      setActiveCategory(filterState.selectedCategoryId)
      
      // Load videos from API
      await loadVideos()
      
      if (process.client) {
        // 무한 스크롤을 위한 Intersection Observer 설정
        const scrollObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                loadMoreVideos()
              }
            })
          },
          {
            root: null,
            rootMargin: '200px', // 200px 전에 미리 로드 시작
            threshold: 0.1
          }
        )
        
        // 페이지 하단에 보이지 않는 트리거 요소 생성
        const trigger = document.createElement('div')
        trigger.id = 'infinite-scroll-trigger'
        trigger.style.height = '1px'
        trigger.style.visibility = 'hidden'
        document.querySelector('.masonry-layout')?.parentElement?.appendChild(trigger)
        scrollObserver.observe(trigger)
        
        // 컴포넌트 언마운트 시 정리
        onUnmounted(() => {
          scrollObserver.disconnect()
          trigger.remove()
        })
      }
    } catch (err) {
      console.error('초기화 실패:', err)
      error.value = '페이지를 불러오는데 실패했습니다.'
    }
  })
  </script>
  
  <style scoped>
  .masonry-layout {
    column-count: 1;
    column-gap: 1rem;
  }
  
  .masonry-item {
    display: inline-block;
    width: 100%;
  }
  
  @media (min-width: 640px) {
    .masonry-layout {
      column-count: 2;
    }
  }
  
  @media (min-width: 768px) {
    .masonry-layout {
      column-count: 2;
    }
  }
  
  @media (min-width: 1024px) {
    .masonry-layout {
      column-count: 3;
    }
  }
  
  @media (min-width: 1280px) {
    .masonry-layout {
      column-count: 4;
    }
  }
  
  @media (min-width: 1536px) {
    .masonry-layout {
      column-count: 5;
    }
  }
  
  @media (min-width: 1920px) {
    .masonry-layout {
      column-count: 5;
    }
  }
  
  @media (min-width: 2560px) {
    .masonry-layout {
      column-count: 6;
    }
  }

  .btn-base {
    @apply text-white px-4 py-2 rounded-md text-sm flex items-center transition-colors;
  }

  .btn-icon-square {
    @apply px-3 py-3 rounded-md transition-colors flex items-center flex-shrink-0;
  }

  .btn-sm-light {
    @apply text-xs px-3 py-1 rounded transition-colors;
  }

  /* 비디오 카드 스타일 */
  .video-card {
    @apply bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-200;
  }

  /* 비디오 카드 선택 모드 스타일 */
  .video-card.selected {
    @apply ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20;
  }

  .video-card.bulk-mode-hover:hover {
    @apply ring-2 ring-gray-400;
  }

  /* 관리자 비디오 컨트롤 버튼 */
  .admin-video-control-btn {
    @apply text-sm;
  }

  /* 비디오 재생불가 대체 링크 버튼 */
  .btn-youtube-alt {
    @apply px-4 py-2 rounded-md inline-flex items-center;
  }

  /* 로드 더 보기 버튼 */
  .btn-load-more {
    @apply px-6 py-3 rounded-md flex items-center transition-colors;
  }

  /* 벌크 액션 툴바 패널 */
  .bulk-action-panel {
    @apply mb-6 p-4 rounded-lg border;
  }

  .bulk-action-panel-light {
    @apply bg-blue-50 border-blue-200;
  }

  .bulk-action-panel-dark {
    @apply dark:bg-blue-900/20 dark:border-blue-800;
  }

  /* 벌크 액션 툴바 텍스트 */
  .bulk-action-text-light {
    @apply text-blue-700;
  }

  .bulk-action-text-dark {
    @apply dark:text-blue-300;
  }

  /* 필터 섹션 입력/선택 필드 */
  .filter-input-select {
    @apply flex-1 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .filter-input-select-light {
    @apply border-gray-300 bg-white text-gray-900;
  }

  .filter-input-select-dark {
    @apply dark:border-gray-600 dark:bg-gray-700 dark:text-white;
  }

  /* 카테고리 태그 */
  .category-tag {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
  }

  .category-tag-light {
    @apply bg-blue-100 text-blue-800;
  }

  .category-tag-dark {
    @apply dark:bg-blue-900 dark:text-blue-200;
  }

  /* 메인 제목 아이콘 */
  .main-icon {
    @apply mr-2;
  }

  /* 로딩 스피너 */
  .loading-spinner {
    @apply animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600;
  }

  /* 에러 메시지 아이콘 */
  .error-icon {
    @apply text-red-500 text-4xl mx-auto mb-4;
  }

  /* 에러 메시지 텍스트 */
  .error-text {
    @apply text-red-600 dark:text-red-400;
  }

  /* 상태 텍스트 (로딩/비디오 수 등) */
  .status-text {
    @apply text-gray-600 dark:text-gray-300;
  }

  /* 선택된 비디오 체크박스 */
  .video-select-checkbox {
    @apply w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2;
  }

  /* 비디오 메타 정보 텍스트 (댓글 수, 업로드일) */
  .video-meta-text {
    @apply text-xs text-gray-500 dark:text-gray-400;
  }

  /* 비디오 컨트롤 버튼 (썸네일, 플레이어, 모달, PIP) */
  .video-control-btn {
    @apply px-2 py-1 rounded-md text-xs transition-colors;
  }

  /* 스레드 컨트롤 버튼 */
  .thread-control-btn {
    @apply px-3 py-1 rounded-md text-sm flex items-center transition-colors;
  }

  /* 구분선 */
  .divider-line {
    @apply border-t border-gray-200 dark:border-gray-700;
  }
  </style>