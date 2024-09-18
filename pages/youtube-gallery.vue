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
                  :autoplay="video.loaded"
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
    <PlayModal :video="selectedVideo" :isOpen="isModalOpen" @close="closeModal" @timeUpdate="updateTime" />
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { Icon } from '@iconify/vue'
  import PlayModal from '@/components/youtubeGallery/PlayModal.vue'

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

  function getThumbnailUrl(videoId) {
  return `https://img.youtube.com/vi/${videoId}/0.jpg`
}
  
  const videoRefs = ref({})
  
  function loadVideo(video) {
    video.loaded = true

    // 다른 곳의 video.loaded를 false로 만들기
    videos.value.forEach(v => {
      if (v.id !== video.id) {
        v.loaded = false
      }
    })
  }

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



  function unloadVideo(video) {
    video.loaded = false
  }
  
  function getEmbedUrl(video) {
    if (video.isShort) {
      return `https://www.youtube.com/embed/${video.id}?autoplay=1`
    }
    return `https://www.youtube.com/embed/${video.id}?autoplay=1`
  }
  
  function getAspectRatioClass(video) {
    return video.isShort ? 'aspect-w-9 aspect-h-16' : 'aspect-w-16 aspect-h-9'
  }
  
  onMounted(() => {
    if (process.client) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const video = videos.value.find(v => videoRefs.value[v.id] === entry.target)
            // if (video) {
            //   loadVideo(video)
            // }
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