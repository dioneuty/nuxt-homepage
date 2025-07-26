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
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center transition-colors"
          >
            <Icon icon="mdi:plus" class="mr-1" />
            비디오 추가
          </button>
          <button
            @click="toggleBulkMode"
            :class="[
              'px-4 py-2 rounded-md text-sm flex items-center transition-colors',
              bulkMode 
                ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            ]"
          >
            <Icon :icon="bulkMode ? 'mdi:close' : 'mdi:checkbox-multiple-marked'" class="mr-1" />
            {{ bulkMode ? '선택 취소' : '대량 선택' }}
          </button>
          <button
            @click="checkAllVideosPlayability"
            :disabled="isCheckingPlayability"
            class="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm flex items-center transition-colors"
          >
            <Icon :icon="isCheckingPlayability ? 'mdi:loading' : 'mdi:play-circle-outline'" class="mr-1" :class="{ 'animate-spin': isCheckingPlayability }" />
            {{ isCheckingPlayability ? '확인 중...' : '재생가능 일괄확인' }}
          </button>
        </div>
      </div>

      <!-- Category Filter -->
      <div class="flex flex-col sm:flex-row gap-4 mb-6">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            카테고리 필터
          </label>
          <div class="flex gap-2">
            <select 
              v-model="selectedCategoryId" 
              @change="onCategoryChange"
              :disabled="isLoading || categoryLoading"
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
              class="px-3 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors flex items-center flex-shrink-0"
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
              v-model="searchQuery"
              @input="onSearchChange"
              :disabled="isLoading"
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
      </div>

      <!-- Bulk Actions Toolbar -->
      <div v-if="bulkMode && isAdmin" class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div class="flex items-center gap-4">
            <span class="text-sm font-medium text-blue-700 dark:text-blue-300">
              {{ selectedVideos.size }}개 비디오 선택됨
            </span>
            <div class="flex gap-2">
              <button
                @click="selectAllVideos"
                class="text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-300 rounded transition-colors"
              >
                전체 선택 ({{ videos.length }})
              </button>
              <button
                @click="selectUncategorized"
                class="text-xs px-3 py-1 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-800 dark:hover:bg-yellow-700 text-yellow-700 dark:text-yellow-300 rounded transition-colors"
              >
                미분류 선택 ({{ uncategorizedCount }})
              </button>
              <button
                @click="selectUnplayable"
                class="text-xs px-3 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-700 dark:text-red-300 rounded transition-colors"
              >
                재생불가 선택 ({{ unplayableCount }})
              </button>
              <button
                @click="clearSelectedVideos"
                class="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded transition-colors"
              >
                선택 해제
              </button>
            </div>
          </div>
          
          <div class="flex gap-2">
            <div v-if="selectedVideos.size === 0" class="text-sm text-gray-500 dark:text-gray-400 py-1 px-2">
              비디오를 선택하여 카테고리를 일괄 변경하세요
            </div>
            <template v-else>
            <select 
              v-model="bulkCategoryId" 
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
              :disabled="!bulkCategoryId || bulkOperationInProgress"
              class="px-4 py-1 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded transition-colors flex items-center"
            >
              <Icon v-if="bulkOperationInProgress" icon="mdi:loading" class="mr-1 animate-spin" />
              <Icon v-else icon="mdi:check" class="mr-1" />
              {{ bulkOperationInProgress ? '적용 중...' : '카테고리 적용' }}
            </button>
            <button
              @click="bulkDeleteVideos"
              :disabled="bulkOperationInProgress"
              class="px-4 py-1 text-sm bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded transition-colors flex items-center"
            >
              <Icon v-if="bulkOperationInProgress" icon="mdi:loading" class="mr-1 animate-spin" />
              <Icon v-else icon="mdi:delete" class="mr-1" />
              {{ bulkOperationInProgress ? '삭제 중...' : `선택된 ${selectedVideos.size}개 삭제` }}
            </button>
            </template>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600 dark:text-gray-300">비디오 목록을 불러오는 중...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <Icon icon="mdi:alert-circle" class="text-red-500 text-4xl mx-auto mb-4" />
        <p class="text-red-600 dark:text-red-400">비디오 목록을 불러오는데 실패했습니다.</p>
        <button
          @click="loadVideos"
          class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          다시 시도
        </button>
      </div>

      <!-- Video Grid -->
      <div v-else class="masonry-layout">
        <div 
          v-for="video in videos" 
          :key="video.id" 
          class="masonry-item mb-4 break-inside-avoid relative"
          :ref="(el) => { if (el) videoRefs[video.videoId] = el }"
        >
          <div :class="[
            'bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-200',
            bulkMode && selectedVideos.has(video.id) ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : '',
            bulkMode ? 'hover:ring-2 hover:ring-gray-400' : ''
          ]">
            <!-- Bulk Selection Checkbox -->
            <div v-if="bulkMode && isAdmin" class="absolute top-2 left-2 z-10">
              <input
                type="checkbox"
                :checked="selectedVideos.has(video.id)"
                @change="toggleVideoSelection(video.id)"
                class="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
            </div>
            
            <!-- Admin Controls for each video -->
            <div v-if="isAdmin && !bulkMode" class="bg-gray-100 dark:bg-gray-700 px-4 py-2 flex justify-end space-x-2">
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
              @click="bulkMode ? toggleVideoSelection(video.id) : loadVideo(video)" 
              :class="['cursor-pointer', bulkMode ? 'select-none' : '']"
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
                        class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md inline-flex items-center"
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
                    :src="`https://img.youtube.com/vi/${video.videoId}/0.jpg`"
                    :alt="video.title"
                    :class="{'w-full min-h-[225px] h-auto aspect-[16/9] object-cover': !video.isShort, 'w-full h-auto aspect-[9/16] object-cover': video.isShort}"
                    loading="lazy"
                    />
              </div>
            </div>
            <div class="p-4">
              <h2 class="text-lg font-semibold mb-2 dark:text-white">{{ video.title }}</h2>
              <p class="text-sm text-gray-600 dark:text-gray-300">{{ video.description }}</p>
              
              <!-- Category Display -->
              <div v-if="video.category" class="flex items-center mt-2 mb-2">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <Icon icon="mdi:tag" class="mr-1 w-3 h-3" />
                  {{ video.category.name }}
                </span>
              </div>
              
              <!-- Thread Stats -->
              <div class="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2 mb-3">
                <Icon icon="mdi:comment-text-outline" class="mr-1" />
                {{ getVideoThreadStats(video.videoId).totalThreads }} thread(s)
              </div>
              
              <!-- Video Controls -->
              <div class="flex justify-between gap-2 mb-3">
                <button class="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded-md text-xs transition-colors" @click="unloadVideo(video)">썸네일</button>
                <button class="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded-md text-xs transition-colors" @click="loadVideo(video)">플레이어</button>
                <button class="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded-md text-xs transition-colors" @click="openModal(video)">모달</button>
                <button 
                  class="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded-md text-xs transition-colors flex items-center" 
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
                  class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm flex items-center transition-colors"
                >
                  <Icon icon="mdi:plus" class="mr-1" />
                  New Thread
                </button>
                <button 
                  @click="toggleThreads(video.videoId)"
                  class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm flex items-center transition-colors"
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
    </div>
    
    <!-- Video Play Modal -->
    <PlayModal :youtubeVideoId="selectedVideo ? selectedVideo.videoId : ''" :isVisible="isModalOpen" @close="closeModal" />
    
    <!-- Video Management Modal -->
    <AdminYouTubeVideoWrite
      :isOpen="showVideoModal"
      :videoItem="selectedVideoForEdit"
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
      :isOpen="showCategoryManageModal"
      @close="closeCategoryManageModal"
      @updated="handleCategoryUpdated"
    />
  </template>
  
  <script setup>
  import { ref, onMounted, watch, computed, nextTick } from 'vue'
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

  const selectedVideo = ref(null)
  const isModalOpen = ref(false)
  
  // Video data management
  const videos = ref([])
  const isLoading = ref(true)
  const error = ref(null)

  // Filter states
  const selectedCategoryId = ref(route.query.category || 'all')
  const searchQuery = ref(route.query.search || '')

  // Bulk selection states
  const bulkMode = ref(false)
  const selectedVideos = ref(new Set())
  const bulkCategoryId = ref('')
  const bulkOperationInProgress = ref(false)

  // Video playability check state
  const isCheckingPlayability = ref(false)

  // Debounced search handling
  let searchTimeout = null
  
  // Video management modal
  const showVideoModal = ref(false)
  const selectedVideoForEdit = ref(null)
  
  // Category management modal
  const showCategoryManageModal = ref(false)
  
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

  const { getEmbedUrl, loadVideo, unloadVideo } = useYoutubeGallery(videos)
  
  const videoRefs = ref({})

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
    return videos.value.filter(video => !video.categoryId).length
  })

  const unplayableCount = computed(() => {
    const unplayableVideos = videos.value.filter(video => 
      video.hasError || (video.isPlayable !== undefined && video.isPlayable === false)
    )
    console.log('unplayableCount debug:', {
      totalVideos: videos.value.length,
      unplayableVideos: unplayableVideos.length,
      videosWithError: videos.value.filter(v => v.hasError).length,
      videosNotPlayable: videos.value.filter(v => v.isPlayable === false).length,
      videosWithUndefinedPlayable: videos.value.filter(v => v.isPlayable === undefined).length,
      sampleUnplayable: unplayableVideos.slice(0, 3).map(v => ({
        title: v.title,
        hasError: v.hasError,
        isPlayable: v.isPlayable
      }))
    })
    return unplayableVideos.length
  })

  /**
   * 서버에서 YouTube 비디오 목록을 로드합니다.
   */
  const loadVideos = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      // Build query parameters
      const queryParams = {
        page: 1,
        limit: 100 // Load more videos for better UX
      }

      // Add category filter
      if (selectedCategoryId.value && selectedCategoryId.value !== 'all') {
        queryParams.categoryId = selectedCategoryId.value
        console.log('YouTubeGallery: 카테고리 필터 적용 -', selectedCategoryId.value)
      }

      // Add search filter
      if (searchQuery.value.trim()) {
        queryParams.searchText = searchQuery.value.trim()
        queryParams.searchType = 'title' // Search in title by default
      }
      
      const response = await $fetch('/api/youtube-gallery', {
        method: 'GET',
        query: queryParams
      })
      
      // API 응답을 기존 videos 형태로 변환
      videos.value = response.items.map(item => ({
        id: item.id,
        videoId: item.videoId,
        title: item.title,
        description: item.description,
        isShort: item.isShort,
        isPlayable: item.isPlayable !== undefined ? item.isPlayable : true, // 기본값 true
        categoryId: item.categoryId,
        category: item.category,
        loaded: false,
        hasError: false
      }))

      // 디버깅: API에서 받은 isPlayable 상태 확인
      console.log('loadVideos debug:', {
        totalVideos: response.items.length,
        isPlayableUndefined: response.items.filter(item => item.isPlayable === undefined).length,
        isPlayableFalse: response.items.filter(item => item.isPlayable === false).length,
        isPlayableTrue: response.items.filter(item => item.isPlayable === true).length,
        sampleVideos: response.items.slice(0, 5).map(item => ({
          title: item.title,
          isPlayable: item.isPlayable
        }))
      })

      // 카테고리 비디오 수는 API에서 가져온 값을 유지
      // recalculateVideoCounts는 필터링된 결과에 영향을 주지 않도록 제거
      
    } catch (err) {
      console.error('비디오 목록 로드 실패:', err)
      error.value = err.message || '비디오 목록을 불러오는데 실패했습니다.'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 비디오 관리 모달을 엽니다.
   */
  const openVideoModal = (video = null) => {
    selectedVideoForEdit.value = video
    showVideoModal.value = true
  }

  /**
   * 비디오 관리 모달을 닫습니다.
   */
  const closeVideoModal = () => {
    showVideoModal.value = false
    selectedVideoForEdit.value = null
  }

  /**
   * 카테고리 관리 모달을 엽니다.
   */
  const openCategoryManageModal = () => {
    showCategoryManageModal.value = true
  }

  /**
   * 카테고리 관리 모달을 닫습니다.
   */
  const closeCategoryManageModal = () => {
    showCategoryManageModal.value = false
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
      console.log(`비디오 재생 가능성 체크: ${video.title} (${video.videoId})`)
      
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
        message: `현재 표시된 ${videos.value.length}개 비디오의 재생 가능성을 확인하시겠습니까?\n재생불가 비디오는 자동으로 표시됩니다.`,
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
      for (const video of videos.value) {
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
              console.log(`비디오 재생불가 감지 (oEmbed 실패): ${video.title}`)
              await updateVideoPlayability(video, false)
              updatedCount++
            }
          } catch (fetchError) {
            // 네트워크 에러 등으로 확인 불가능한 경우 건너뛰기
            console.log(`비디오 상태 확인 실패: ${video.title}`, fetchError)
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


  const openModal = (video) => { selectedVideo.value = video; isModalOpen.value = true }
  const closeModal = () => { isModalOpen.value = false; selectedVideo.value = null }
  const updateVideoTime = (time) => { if (selectedVideo.value) selectedVideo.value.currentTime = time }
  
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
    
    if (selectedCategoryId.value === 'all') {
      delete query.category
    } else {
      query.category = selectedCategoryId.value
    }

    router.push({ query })
    setActiveCategory(selectedCategoryId.value)
    loadVideos()
  }

  /**
   * 검색어 변경 시 호출되는 함수 (디바운스 적용)
   */
  const onSearchChange = () => {
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    // Set new timeout for debounced search
    searchTimeout = setTimeout(() => {
      const query = { ...route.query }
      
      if (searchQuery.value.trim()) {
        query.search = searchQuery.value.trim()
      } else {
        delete query.search
      }

      router.push({ query })
      loadVideos()
    }, 300) // 300ms debounce delay
  }

  /**
   * 대량 선택 모드를 토글합니다.
   */
  const toggleBulkMode = () => {
    bulkMode.value = !bulkMode.value
    if (!bulkMode.value) {
      clearSelectedVideos()
    }
  }

  /**
   * 비디오 선택 상태를 토글합니다.
   */
  const toggleVideoSelection = (videoId) => {
    if (selectedVideos.value.has(videoId)) {
      selectedVideos.value.delete(videoId)
    } else {
      selectedVideos.value.add(videoId)
    }
    // Vue의 반응성을 위해 새로운 Set으로 교체
    selectedVideos.value = new Set(selectedVideos.value)
  }

  /**
   * 현재 페이지의 모든 비디오를 선택합니다.
   */
  const selectAllVideos = () => {
    videos.value.forEach(video => {
      selectedVideos.value.add(video.id)
    })
    selectedVideos.value = new Set(selectedVideos.value)
  }

  /**
   * 모든 선택을 해제합니다.
   */
  const clearSelectedVideos = () => {
    selectedVideos.value.clear()
    selectedVideos.value = new Set(selectedVideos.value)
    bulkCategoryId.value = ''
  }

  /**
   * 카테고리가 없는 미분류 비디오들을 선택합니다.
   */
  const selectUncategorized = () => {
    const uncategorizedIds = videos.value
      .filter(video => !video.categoryId)
      .map(video => video.id)
    
    uncategorizedIds.forEach(id => selectedVideos.value.add(id))
    selectedVideos.value = new Set(selectedVideos.value)
  }

  /**
   * 재생할 수 없는 비디오들을 선택합니다.
   */
  const selectUnplayable = () => {
    const unplayableIds = videos.value
      .filter(video => 
        video.hasError || (video.isPlayable !== undefined && video.isPlayable === false)
      )
      .map(video => video.id)
    
    unplayableIds.forEach(id => selectedVideos.value.add(id))
    selectedVideos.value = new Set(selectedVideos.value)
  }

  /**
   * 선택된 비디오들에 카테고리를 일괄 적용합니다.
   */
  const applyBulkCategoryChange = async () => {
    if (!bulkCategoryId.value || selectedVideos.value.size === 0) {
      showToast('카테고리와 비디오를 선택해주세요.', 'warning')
      return
    }

    try {
      const confirmed = await showConfirm({
        title: '카테고리 변경',
        message: `선택된 ${selectedVideos.value.size}개 비디오의 카테고리를 변경하시겠습니까?`,
        type: 'warning',
        confirmText: '변경',
        cancelText: '취소'
      })

      if (!confirmed) return
    } catch (err) {
      return
    }

    try {
      bulkOperationInProgress.value = true

      const categoryId = bulkCategoryId.value === 'uncategorized' ? null : bulkCategoryId.value
      const videoIds = Array.from(selectedVideos.value)

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
      bulkOperationInProgress.value = false
    }
  }

  /**
   * 선택된 비디오들을 일괄 삭제합니다.
   */
  const bulkDeleteVideos = async () => {
    if (selectedVideos.value.size === 0) {
      showToast('삭제할 비디오를 선택해주세요.', 'warning')
      return
    }

    const selectedVideoTitles = videos.value
      .filter(video => selectedVideos.value.has(video.id))
      .map(video => video.title)
      .slice(0, 3) // 처음 3개만 표시

    const titlePreview = selectedVideoTitles.join(', ')
    const moreCount = selectedVideos.value.size - selectedVideoTitles.length
    const previewText = moreCount > 0 
      ? `${titlePreview} 외 ${moreCount}개`
      : titlePreview

    try {
      const confirmed = await showConfirm({
        title: '비디오 대량 삭제',
        message: `선택된 ${selectedVideos.value.size}개 비디오를 삭제하시겠습니까?\n\n삭제할 비디오:\n${previewText}\n\n이 작업은 되돌릴 수 없습니다.`,
        type: 'danger',
        confirmText: '삭제',
        cancelText: '취소'
      })

      if (!confirmed) return
    } catch (err) {
      return
    }

    try {
      bulkOperationInProgress.value = true
      const videoIds = Array.from(selectedVideos.value)
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
      bulkOperationInProgress.value = false
    }
  }

  // Watch for URL parameter changes
  watch(() => route.query.category, (newCategory) => {
    selectedCategoryId.value = newCategory || 'all'
    // 카테고리 변경 시 선택된 비디오 초기화
    if (bulkMode.value) {
      clearSelectedVideos()
    }
    if (categories.value.length > 0) {
      loadVideos()
    }
  })

  watch(() => route.query.search, (newSearch) => {
    searchQuery.value = newSearch || ''
    // 검색어 변경 시 선택된 비디오 초기화
    if (bulkMode.value) {
      clearSelectedVideos()
    }
    if (categories.value.length > 0) {
      loadVideos()
    }
  })

  // 비디오 목록 변경 시 선택된 비디오 검증
  watch(videos, (newVideos) => {
    if (bulkMode.value && selectedVideos.value.size > 0) {
      const currentVideoIds = new Set(newVideos.map(v => v.id))
      const validSelectedVideos = new Set()
      
      selectedVideos.value.forEach(videoId => {
        if (currentVideoIds.has(videoId)) {
          validSelectedVideos.add(videoId)
        }
      })
      
      selectedVideos.value = validSelectedVideos
    }
  })

  // Future enhancement: 유튜브 갤러리 크게 보기 화면 구현 
  // Enhanced video player modal with fullscreen support and improved UX
  
  onMounted(async () => {
    try {
      console.log('YoutubeGalleryPage: onMounted hook 실행됨');
      
      // Load categories first - 항상 최신 데이터를 가져오도록 강제 호출
      console.log('YoutubeGalleryPage: fetchCategories 호출 전 - categories:', categories?.value, 'sortedCategories:', sortedCategories?.value, 'totalVideoCount:', totalVideoCount?.value);
      
      // 카테고리 데이터를 강제로 다시 불러와서 최신 비디오 수 반영
      console.log('YoutubeGalleryPage: 최신 카테고리 데이터를 위해 fetchCategories를 호출합니다.');
      await fetchCategories();
      
      console.log('YoutubeGalleryPage: fetchCategories 호출 후 - categories:', categories?.value, 'sortedCategories:', sortedCategories?.value, 'totalVideoCount:', totalVideoCount?.value);

      // Set active category from URL or default to 'all'
      setActiveCategory(selectedCategoryId.value)
      
      // Load videos from API
      await loadVideos()
      
      if (process.client) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const video = videos.value.find(v => videoRefs.value[v.videoId] === entry.target)
              if (video) {
                // loadVideo(video) // Removed this line to prevent auto-loading
              }
              observer.unobserve(entry.target)
            }
          })
        })
    
        Object.values(videoRefs.value).forEach(el => observer.observe(el))
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
  </style>