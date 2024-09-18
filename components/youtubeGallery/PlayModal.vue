<template>
    <div v-if="isOpen" class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex">
      <div class="relative p-8 bg-white dark:bg-gray-800 w-full m-auto flex-col flex rounded-lg" :class="{'max-w-screen-xl': !video.isShort, 'max-w-[500px]': video.isShort}">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold dark:text-white">{{ video.title }}</h2>
          <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">
            <Icon icon="mdi:close" class="text-2xl" />
          </button>
        </div>
        <div :class="getAspectRatioClass(video)">
          <iframe 
            :src="getEmbedUrl(video)"
            :class="{ 'w-full h-auto aspect-[16/9]': !video.isShort, 'w-full h-auto aspect-[9/16]': video.isShort }"
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
          ></iframe>
        </div>
        <p class="mt-4 text-gray-600 dark:text-gray-300">{{ video.description }}</p>
        <p class="mt-2 text-sm text-blue-500">
          현재 재생 시간: {{ formatTime(currentTime) }}
        </p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import { Icon } from '@iconify/vue'
  
  const props = defineProps({
    video: Object,
    isOpen: Boolean
  })
  
  const emit = defineEmits(['close', 'timeUpdate'])
  
  const player = ref(null)
  const currentTime = ref(0)
  
  function getEmbedUrl(video) {
    const baseUrl = `https://www.youtube.com/embed/${video.id}`
    return video.isShort ? `${baseUrl}?loop=1&playlist=${video.id}` : baseUrl
  }
  
  function getAspectRatioClass(video) {
    return video.isShort ? 'aspect-w-9 aspect-h-16' : 'aspect-w-16 aspect-h-9'
  }
  
  function formatTime(time) {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  
  watch(() => props.isOpen, (newValue) => {
    if (newValue) {
      onMounted(() => {
        player.value = new YT.Player('player', {
          height: '100%',
          width: '100%',
          videoId: props.video.id,
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        })
      })
    } else {
      if (player.value) {
        player.value.destroy()
      }
    }
  })
  
  function onPlayerReady(event) {
    event.target.playVideo()
  }
  
  function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
      setInterval(() => {
        currentTime.value = event.target.getCurrentTime()
        emit('timeUpdate', currentTime.value)
      }, 1000)
    }
  }
  
  onUnmounted(() => {
    if (player.value) {
      player.value.destroy()
    }
  })
  </script>