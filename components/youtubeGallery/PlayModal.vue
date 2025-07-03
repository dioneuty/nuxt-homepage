<template>
    <div v-if="isVisible" class="glassmorphism-modal-overlay fixed inset-0 z-50 overflow-auto backdrop-blur-sm bg-black/75 flex items-center justify-center" @click="closeModalOutside">
      <div class="glassmorphism-youtube-modal relative p-8 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 w-full max-w-screen-xl mx-auto flex-col flex rounded-2xl shadow-2xl border border-white/30 dark:border-gray-700/30" @click.stop>
        <div class="flex justify-end items-center mb-4">
          <button @click="$emit('close')" class="glassmorphism-youtube-close backdrop-blur-sm bg-red-500/80 hover:bg-red-600/80 text-white p-2 rounded-full transition-all duration-200 border border-white/20 shadow-lg hover:scale-110">
            <Icon icon="mdi:close" class="text-xl" />
          </button>
        </div>
        <div class="glassmorphism-youtube-player relative w-full pb-[56.25%] rounded-xl overflow-hidden shadow-lg border border-white/20 dark:border-gray-600/20" style="height: 0;">
          <iframe
            :src="getEmbedUrl(youtubeVideoId)"
            class="absolute top-0 left-0 w-full h-full rounded-xl"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
          ></iframe>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { Icon } from '@iconify/vue'
  
  const props = defineProps({
    youtubeVideoId: {
      type: String,
      required: true
    },
    isVisible: {
      type: Boolean,
      default: false
    }
  })
  
  const emit = defineEmits(['close'])
  
  /**
   * YouTube 비디오 임베드 URL을 생성하는 함수입니다.
   * @param {string} videoId - 크게 볼 YouTube 영상의 ID.
   * @returns {string} YouTube 임베드 URL.
   */
  function getEmbedUrl(videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`; // 자동 재생 추가
  }

  /**
   * 모달 외부 클릭 시 모달을 닫는 함수입니다.
   */
  const closeModalOutside = () => {
    emit('close');
  };
  </script>
  
  <style scoped>
  /* Tailwind CSS를 통해 대부분의 스타일이 처리됩니다. */
  /* 필요한 경우 추가 스타일을 여기에 정의할 수 있습니다. */
  </style>