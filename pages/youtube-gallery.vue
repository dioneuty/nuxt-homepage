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
          class="masonry-item mb-4 break-inside-avoid"
          :ref="(el) => { if (el) videoRefs[video.videoId] = el }"
        >
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <!-- Admin Controls for each video -->
            <div v-if="isAdmin" class="bg-gray-100 dark:bg-gray-700 px-4 py-2 flex justify-end space-x-2">
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

            <div @click="loadVideo(video)" class='cursor-pointer'>
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
              
              <!-- Thread Stats -->
              <div class="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2 mb-3">
                <Icon icon="mdi:comment-text-outline" class="mr-1" />
                {{ getVideoThreadStats(video.videoId).totalThreads }} thread(s)
              </div>
              
              <!-- Video Controls -->
              <div class="flex justify-between mb-3">
                <button class="bg-gray-500 text-white px-2 py-1 rounded-md text-sm" @click="unloadVideo(video)">썸네일</button>
                <button class="bg-gray-500 text-white px-2 py-1 rounded-md text-sm" @click="loadVideo(video)">플레이어</button>
                <button class="bg-gray-500 text-white px-2 py-1 rounded-md text-sm" @click="openModal(video)">모달</button>
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
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { Icon } from '@iconify/vue'
  import PlayModal from '@/components/youtubeGallery/PlayModal.vue'
  import ThreadEditor from '@/components/youtubeGallery/ThreadEditor.vue'
  import ThreadDisplay from '@/components/youtubeGallery/ThreadDisplay.vue'
  import AdminYouTubeVideoWrite from '@/components/admin/AdminYouTubeVideoWrite.vue'
  import useYoutubeGallery from '@/composables/useYoutubeGallery'
  import useVideoThreads from '@/composables/useVideoThreads'
  import { useAuth } from '@/composables/useAuth'
  import { useToast } from '@/composables/useToast'

  const { isAdmin } = useAuth()
  const { showToast } = useToast()

  const selectedVideo = ref(null)
  const isModalOpen = ref(false)
  
  // Video data management
  const videos = ref([])
  const isLoading = ref(true)
  const error = ref(null)
  
  // Video management modal
  const showVideoModal = ref(false)
  const selectedVideoForEdit = ref(null)
  
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

  /**
   * 서버에서 YouTube 비디오 목록을 로드합니다.
   */
  const loadVideos = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await $fetch('/api/youtube-gallery', {
        method: 'GET'
      })
      
      // API 응답을 기존 videos 형태로 변환
      videos.value = response.items.map(item => ({
        id: item.id,
        videoId: item.videoId,
        title: item.title,
        description: item.description,
        isShort: item.isShort,
        loaded: false,
        hasError: false
      }))
      
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
   * 비디오 목록을 새로고침합니다.
   */
  const handleVideoRefresh = () => {
    loadVideos()
  }

  /**
   * 비디오를 삭제합니다.
   */
  const handleVideoDelete = async (video) => {
    if (!isAdmin.value) {
      showToast('관리자 권한이 필요합니다.', 'error')
      return
    }

    if (!confirm(`"${video.title}" 비디오를 삭제하시겠습니까?`)) {
      return
    }

    try {
      await $fetch(`/api/admin/youtube-gallery/${video.id}`, {
        method: 'DELETE'
      })
      
      showToast('비디오가 성공적으로 삭제되었습니다.', 'success')
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
  
  const handleVideoError = (video) => { video.hasError = true }

  const openModal = (video) => { selectedVideo.value = video; isModalOpen.value = true }
  const closeModal = () => { isModalOpen.value = false; selectedVideo.value = null }
  const updateVideoTime = (time) => { if (selectedVideo.value) selectedVideo.value.currentTime = time }

  // TODO: 유튜브 갤러리 크게 보기 화면 구현
  // 1. `components/youtubeGallery/PlayModal.vue` 수정:
  //    - 현재 모달에서 유튜브 비디오를 재생하는 기능을 확장하여, 비디오를 더 크게 볼 수 있는 모드 또는 옵션을 추가합니다.
  //    - 예를 들어, 전체 화면 버튼이나 모달 크기를 동적으로 조절하는 기능을 고려할 수 있습니다.
  // 2. `pages/youtube-gallery.vue` 수정:
  //    - 갤러리 목록에서 특정 유튜브 비디오를 클릭했을 때, 기존 `PlayModal.vue`을 호출하되, 크게 보기 화면으로 전환될 수 있도록 로직을 수정합니다.
  //    - 별도의 크게 보기 전용 컴포넌트가 필요하다면, 새로 생성하고 해당 컴포넌트를 이 페이지에서 관리하도록 합니다.
  // 3. 라우팅 고려 (필요시):
  //    - 만약 유튜브 크게 보기 화면이 독립적인 URL을 가져야 한다면, Nuxt.js 라우팅을 사용하여 동적 라우팅을 설정합니다 (예: `/youtube-gallery/:id`).
  //    - 하지만 모달 형태로 충분하다면, 별도의 라우팅은 필요하지 않습니다.
  // 4. 스타일링 (CSS/Tailwind CSS):
  //    - 크게 보기 화면의 UI/UX를 개선하기 위한 CSS 스타일을 추가하거나 Tailwind CSS 클래스를 활용합니다. 특히 반응형 디자인을 고려하여 다양한 화면 크기에서 잘 보이도록 합니다.
  // 5. API 연동 (필요시):
  //    - 만약 유튜브 비디오 정보를 서버에서 가져오거나 특정 비디오 시청 기록 등을 저장해야 한다면, 관련 API를 개발하거나 기존 API를 수정합니다. 현재 파일 구조상 `server/api/gallery` 또는 유사한 경로에 추가될 수 있습니다.
  
  onMounted(async () => {
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