<template>
    <div class="mx-auto h-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6 dark:text-white flex items-center">
        <Icon icon="mdi:youtube" class="mr-2" />
        유튜브 갤러리
      </h1>
      
      <div class="masonry-layout">
        <div 
          v-for="video in videos" 
          :key="video.id" 
          class="masonry-item mb-4 break-inside-avoid"
          :ref="(el) => { if (el) videoRefs[video.id] = el }"
        >
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div @click="loadVideo(video)" class='cursor-pointer'>
              <div v-if="video.loaded">
                <iframe 
                  :class="{ 'w-full min-h-[225px] h-auto aspect-[16/9]': !video.isShort, 'w-full h-auto aspect-[9/16]': video.isShort }"
                  :src="getEmbedUrl(video)"
                  frameborder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen
                ></iframe>
              </div>
              <div v-else>
                <img
                    :src="`https://img.youtube.com/vi/${video.id}/0.jpg`"
                    :alt="video.title"
                    :class="{'w-full min-h-[225px] h-auto aspect-[16/9] object-cover': !video.isShort, 'w-full h-auto aspect-[9/16] object-cover': video.isShort}"
                    loading="lazy"
                    />
              </div>
            </div>
            <div class="p-4">
              <h2 class="text-lg font-semibold mb-2 dark:text-white">{{ video.title }}</h2>
              <p class="text-sm text-gray-600 dark:text-gray-300">{{ video.description }}</p>
              <div class="flex justify-between">
                <button class="bg-gray-500 text-white px-2 py-1 rounded-md mt-2" @click="unloadVideo(video)">썸네일</button>
                <button class="bg-gray-500 text-white px-2 py-1 rounded-md mt-2" @click="loadVideo(video)">플레이어</button>
                <button class="bg-gray-500 text-white px-2 py-1 rounded-md mt-2" @click="openModal(video)">모달</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <PlayModal :youtubeVideoId="selectedVideo ? selectedVideo.id : null" :isVisible="isModalOpen" @close="closeModal" />
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { Icon } from '@iconify/vue'
  import PlayModal from '@/components/youtubeGallery/PlayModal.vue'
  import useYoutubeGallery from '@/composables/useYoutubeGallery'

  const selectedVideo = ref(null)
  const isModalOpen = ref(false)

  
  const videos = ref([
    { id: 'dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up', description: 'Official music video', loaded: false, isShort: false },
    { id: 'zdPEWrW4TIw', title: 'YouTube 비디오 1', description: '새로 추가된 YouTube 비디오', loaded: false, isShort: false },
    { id: '1-sthGL34FA', title: 'YouTube Short', description: '새로 추가된 YouTube Short', loaded: false, isShort: true },
    { id: 'x1sZjAtePx8', title: 'YouTube 비디오 2', description: '새로 추가된 YouTube 비디오', loaded: false, isShort: false },
    { id: 'jNQXAC9IVRw', title: 'Me at the zoo', description: 'The first video on YouTube', loaded: false, isShort: false },
    { id: '6A0bCLmAXrk', title: 'YouTube 비디오 3', description: '새로 추가된 YouTube 비디오', loaded: false, isShort: false },
    //https://www.youtube.com/watch?v=mHUrRj0IoIs&list=RDmHUrRj0IoIs&start_radio=1
    { id: 'mHUrRj0IoIs', title: 'YouTube 비디오 4', description: '새로 추가된 YouTube 비디오', loaded: false, isShort: false },
    //https://www.youtube.com/watch?v=Mgg90NYAvvc
    { id: 'Mgg90NYAvvc', title: 'YouTube 비디오 5', description: '새로 추가된 YouTube 비디오', loaded: false, isShort: false },
    { id: '5em1MuTz3aQ', title: 'YouTube Short 2', description: '새로 추가된 YouTube Short', loaded: false, isShort: true },
    { id: 'xqvHMmc1csM', title: 'YouTube 비디오 6', description: '새로 추가된 YouTube 비디오', loaded: false, isShort: false },
    //https://www.youtube.com/watch?v=Ev2DJFa9isY
    { id: 'Ev2DJFa9isY', title: 'YouTube 비디오 7', description: '새로 추가된 YouTube 비디오', loaded: false, isShort: false },
    { id: 'SO-ABoaaCNg', title: 'YouTube 비디오 8', description: '새로 추가된 YouTube 비디오', loaded: false, isShort: false },
    //https://www.youtube.com/watch?v=odRZzI_P0Lk
    { id: 'WlXjN48UyFM', title: 'YouTube Short 3', description: '새로 추가된 YouTube Short', loaded: false, isShort: true },
    { id: 'odRZzI_P0Lk', title: 'YouTube 비디오 9', description: '새로 추가된 YouTube 비디오', loaded: false, isShort: false },
    //https://www.youtube.com/shorts/WlXjN48UyFM
    //https://www.youtube.com/watch?v=EHhvP0EMhfE
    { id: 'EHhvP0EMhfE', title: 'YouTube 비디오 10', description: '새로 추가된 YouTube 비디오', loaded: false, isShort: false },
    //https://www.youtube.com/watch?v=XIPLXi1gfv8
    { id: 'XIPLXi1gfv8', title: 'YouTube 비디오 11', description: '새로 추가된 YouTube 비디오', loaded: false, isShort: false },
    //https://www.youtube.com/watch?v=WIA825Dd8dc
    { id: 'WIA825Dd8dc', title: 'YouTube 비디오 12', description: '새로 추가된 YouTube 비디오', loaded: false, isShort: false },
    //https://www.youtube.com/watch?v=EHhvP0EMhfE
    { id: 'EHhvP0EMhfE', title: '피식대학 - 헬스장 레전드', description: '피식대학의 유머러스한 헬스장 상황', loaded: false, isShort: false },
    //https://www.youtube.com/watch?v=XIPLXi1gfv8
    { id: 'XIPLXi1gfv8', title: '피식대학 - 학교에서 생긴 일', description: '학교 생활을 재치있게 표현한 영상', loaded: false, isShort: false },
  { id: 'WlXjN48UyFM', title: '피식대학 쇼츠 - 웃긴 순간 모음', description: '피식대학의 짧은 웃음 영상', loaded: false, isShort: true },
    
  ])

  const { getEmbedUrl, loadVideo, unloadVideo } = useYoutubeGallery(videos)
  
  const videoRefs = ref({})
  
  function openModal(video) {
    selectedVideo.value = video
    isModalOpen.value = true
  }


  function closeModal() {
    isModalOpen.value = false
    selectedVideo.value = null
  }

  function updateVideoTime(time) {
    if (selectedVideo.value) {
      selectedVideo.value.currentTime = time
    }
  }

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
  
  onMounted(() => {
    if (process.client) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const video = videos.value.find(v => videoRefs.value[v.id] === entry.target)
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