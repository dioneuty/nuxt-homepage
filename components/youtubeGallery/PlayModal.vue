<template>
    <div v-if="isVisible" class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-75 flex items-center justify-center" @click="closeModalOutside">
      <div class="relative p-8 bg-white dark:bg-gray-800 w-full max-w-screen-xl mx-auto flex-col flex rounded-lg" @click.stop>
        <div class="flex justify-end items-center mb-4">
          <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">
            <Icon icon="mdi:close" class="text-3xl" />
          </button>
        </div>
        <div class="relative w-full pb-[56.25%]" style="height: 0;">
          <iframe
            :src="getEmbedUrl(youtubeVideoId)"
            class="absolute top-0 left-0 w-full h-full"
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