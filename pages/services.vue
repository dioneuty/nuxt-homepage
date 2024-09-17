<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 dark:text-white text-center">웹 개발 서비스</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="service in services" :key="service.id" class="bg-white shadow-md rounded-lg p-6 dark:bg-gray-800 dark:text-white flex flex-col items-center">
        <div class="mb-4">
          <Icon :icon="service.icon" class="w-16 h-16 text-blue-500" />
        </div>
        <div class="text-center">
          <h2 class="text-xl font-semibold mb-2">{{ service.title }}</h2>
          <p class="text-gray-600 dark:text-gray-300">{{ service.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';

definePageMeta ({
  title: '웹 개발 서비스 - Dion',
  meta: [
    { name: 'description', content: 'Dion - 웹 개발 서비스' },
    { name: 'keywords', content: 'Dion, 웹 개발 서비스' }
  ]
})

const services = ref([
  { 
    id: 1, 
    title: '반응형 웹사이트 개발', 
    description: 'Tailwind CSS를 사용하여 모든 디바이스에서 최적화된 경험을 제공하는 반응형 웹사이트를 개발합니다. 모바일, 태블릿, 데스크톱에서 완벽하게 작동합니다.',
    icon: 'mdi:responsive'
  },
  { 
    id: 2, 
    title: '프론트엔드 개발', 
    description: 'Nuxt.js, Svelte.kit 등의 최신 프레임워크를 사용하여 동적이고 인터랙티브한 사용자 인터페이스를 구축합니다.',
    icon: 'mdi:language-javascript'
  },
  { 
    id: 3, 
    title: '백엔드 개발', 
    description: 'Node.js, Express, Spring Boot 등을 사용하여 안정적이고 확장 가능한 서버 사이드 애플리케이션을 개발합니다.',
    icon: 'mdi:server'
  },
  { 
    id: 4, 
    title: 'API 개발', 
    description: 'RESTful API, SQL, SPRING BOOT 등을 사용하여 효율적이고 안전한 데이터 교환 시스템을 구축합니다.',
    icon: 'mdi:api'
  },
  { 
    id: 5, 
    title: '데이터베이스 설계 및 최적화', 
    description: 'SQL 및 NoSQL 데이터베이스를 설계하고 최적화하여 데이터를 효율적으로 저장하고 검색합니다.',
    icon: 'mdi:database'
  },
  { 
    id: 6, 
    title: '웹 성능 최적화', 
    description: '웹사이트의 로딩 속도를 개선하고 전반적인 성능을 최적화하여 사용자 경험을 향상시킵니다. SWR, ISR, 캐싱 등을 사용하여 성능을 최적화합니다.',
    icon: 'mdi:speedometer'
  },
  { 
    id: 8, 
    title: '웹 애플리케이션 보안', 
    description: 'HTTPS 구현, XSS 및 CSRF 방지 등 SPRING SECURITY와 자체 프론트엔드 프레임워크의 보안 기능 등을 이용하여, 웹 애플리케이션의 보안을 강화하여 데이터와 사용자를 보호합니다.',
    icon: 'mdi:security'
  },
])
</script>