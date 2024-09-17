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
            <div 
              v-lazy-load="() => loadVideo(video)"
            >
              <div v-if="video.loaded">
                <iframe 
                  :class="{ 'w-full h-auto aspect-[16/9]': !video.isShort, 'w-full h-auto aspect-[9/16]': video.isShort }"
                  :src="getEmbedUrl(video)"
                  frameborder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen
                ></iframe>
              </div>
              <div v-else :class="getAspectRatioClass(video) + ' bg-gray-200 dark:bg-gray-700 flex items-center justify-center'">
                <span class="text-gray-500 dark:text-gray-400">로딩 중...</span>
              </div>
            </div>
            <div class="p-4">
              <h2 class="text-lg font-semibold mb-2 dark:text-white">{{ video.title }}</h2>
              <p class="text-sm text-gray-600 dark:text-gray-300">{{ video.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { Icon } from '@iconify/vue'
  
  const videos = ref([
    { id: 'dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up', description: 'Official music video', loaded: false, isShort: false },
    { id: 'zdPEWrW4TIw', title: 'YouTube 비디오 1', description: '새로 추가된 YouTube 비디오', loaded: false, isShort: false },
    { id: '1-sthGL34FA', title: 'YouTube Short', description: '새로 추가된 YouTube Short', loaded: false, isShort: true },
    { id: 'x1sZjAtePx8', title: 'YouTube 비디오 2', description: '새로 추가된 YouTube 비디오', loaded: false, isShort: false },
    { id: 'jNQXAC9IVRw', title: 'Me at the zoo', description: 'The first video on YouTube', loaded: false, isShort: false },
    { id: '6A0bCLmAXrk', title: 'YouTube 비디오 3', description: '새로 추가된 YouTube 비디오', loaded: false, isShort: false },
  ])
  
  const videoRefs = ref({})
  
  function loadVideo(video) {
    video.loaded = true
  }
  
  function getEmbedUrl(video) {
    if (video.isShort) {
      return `https://www.youtube.com/embed/${video.id}?loop=1&playlist=${video.id}`
    }
    return `https://www.youtube.com/embed/${video.id}`
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
            if (video) {
              loadVideo(video)
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
      column-count: 6;
    }
  }
  
  @media (min-width: 2560px) {
    .masonry-layout {
      column-count: 6;
    }
  }
  </style>