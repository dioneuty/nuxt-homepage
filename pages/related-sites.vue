<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8 text-center text-blue-600 dark:text-blue-400">
      <Icon icon="mdi:link-variant" class="inline-block mr-2" />
      관련 사이트
    </h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="site in relatedSites" :key="site.id" class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
        <a :href="site.url" target="_blank" rel="noopener noreferrer" class="block">
          <div class="p-6">
            <div class="flex items-center mb-4">
              <img v-if="site.customIcon" :src="site.customIcon" class="w-6 h-6 mr-3" alt="사이트 아이콘">
              <Icon v-if="site.icon" :icon="site.icon" class="text-3xl mr-3 text-blue-500" />
              <h2 class="text-xl font-semibold text-gray-800 dark:text-white">{{ site.name }}</h2>
            </div>
            <p class="text-gray-600 dark:text-gray-300">{{ site.description }}</p>
          </div>
          <div class="bg-blue-500 text-white py-2 px-4 text-center">
            방문하기
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

definePageMeta ({
  title: '관련 사이트 - Dion',
  meta: [
    { name: 'description', content: 'Dion - 관련 사이트' },
    { name: 'keywords', content: 'Dion, 관련 사이트' }
  ]
})

let idx = 0

const relatedSites = ref([
  {
    id: idx++,
    name: '블루드릴',
    url: 'https://bluedrills.com',
    description: '블루드릴 공식 웹사이트입니다. 다양한 정보와 서비스를 제공합니다.',
    customIcon: '/icons/logo260260-nobg.png'
  },
  // 블루드릴 네이버 블로그 (https://blog.naver.com/bluedrills)
  {
    id: idx++,
    name: '블루드릴 네이버 블로그',
    url: 'https://blog.naver.com/bluedrills',
    description: '블루드릴 네이버 블로그입니다. 합리적인 가격과 양질의 서비스를 제공합니다.',
    icon: 'mdi:blog',
    customIcon: '/icons/logo260260-nobg.png'
  },
  // 플라워 써클 유튜브 (https://www.youtube.com/@%ED%94%8C%EB%9D%BC%EC%9B%8C%EC%8D%A8%ED%81%B4)
  {
    id: idx++,
    name: '플라워 써클 유튜브',
    url: 'https://www.youtube.com/@플라워써클',
    description: '플라워 써클 유튜브입니다. 매우 즐거운 동물 관련 유머 동영상을 보여줍니다.',
    icon: 'mdi:youtube',
    customIcon: '/icons/channels4_profile.jpg'
  },
  {
    id: idx++,
    name: '네이버 지도',
    url: 'https://map.naver.com',
    description: '네이버에서 제공하는 지도 서비스입니다. 길찾기, 주변 검색 등 다양한 기능을 제공합니다.',
    icon: 'mdi:map'
  },
  {
    id: idx++,
    name: '깃허브',
    url: 'https://github.com',
    description: '개발자들을 위한 버전 관리 및 협업 플랫폼입니다.',
    icon: 'mdi:github'
  },
  {
    id: idx++,
    name: 'Stack Overflow',
    url: 'https://stackoverflow.com',
    description: '프로그래머를 위한 질문답변 커뮤니티입니다.',
    icon: 'mdi:stack-overflow'
  },
  {
    id: idx++,
    name: 'MDN Web Docs',
    url: 'https://developer.mozilla.org',
    description: '웹 기술에 대한 포괄적인 문서를 제공하는 리소스입니다.',
    icon: 'mdi:mozilla'
  },
  {
    id: idx++,
    name: 'Vue.js',
    url: 'https://vuejs.org',
    description: '사용자 인터페이스를 구축하기 위한 진보적인 JavaScript 프레임워크입니다.',
    icon: 'mdi:vuejs'
  }
])
</script>