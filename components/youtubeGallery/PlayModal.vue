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
  
  /**
   * YouTube 비디오 임베드 URL을 생성하는 함수입니다.
   * 쇼츠(shorts) 비디오인 경우 루프 및 재생 목록 옵션을 추가합니다.
   * @param {object} video - 비디오 정보를 담고 있는 객체.
   * @returns {string} YouTube 임베드 URL.
   */
  function getEmbedUrl(video) {
    const baseUrl = `https://www.youtube.com/embed/${video.id}`
    return video.isShort ? `${baseUrl}?loop=1&playlist=${video.id}` : baseUrl
  }
  
  /**
   * 비디오의 가로세로 비율에 따른 Tailwind CSS 클래스를 반환하는 함수입니다.
   * 쇼츠 비디오는 9:16, 일반 비디오는 16:9 비율을 적용합니다.
   * @param {object} video - 비디오 정보를 담고 있는 객체.
   * @returns {string} Tailwind CSS 가로세로 비율 클래스.
   */
  function getAspectRatioClass(video) {
    return video.isShort ? 'aspect-w-9 aspect-h-16' : 'aspect-w-16 aspect-h-9'
  }
  
  /**
   * 시간을 '분:초' 형식으로 포맷하는 함수입니다.
   * @param {number} time - 초 단위의 시간.
   * @returns {string} 포맷된 시간 문자열 (예: '0:30').
   */
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
  
  /**
   * YouTube 플레이어가 준비되었을 때 호출되는 함수입니다.
   * 비디오를 자동으로 재생합니다.
   * @param {object} event - YT.Player 이벤트 객체.
   */
  function onPlayerReady(event) {
    event.target.playVideo()
  }
  
  /**
   * YouTube 플레이어 상태가 변경될 때 호출되는 함수입니다.
   * 비디오 재생 중일 때 현재 재생 시간을 1초마다 업데이트합니다.
   * @param {object} event - YT.Player 이벤트 객체.
   */
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