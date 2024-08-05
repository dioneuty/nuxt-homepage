<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 dark:text-white">블루드릴 집 수리 서비스</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="service in services" :key="service.id" class="bg-white shadow-md rounded-lg p-6 dark:bg-gray-800 dark:text-white flex">
        <div class="flex-grow">
          <h2 class="text-xl font-semibold mb-2">{{ service.title }}</h2>
          <p class="text-gray-600 dark:text-gray-300">{{ service.description }}</p>
        </div>
        <div class="ml-4 flex-shrink-0">
          <img :src="`/images/${service.image}`" :alt="service.title" class="w-24 h-24 object-cover rounded-lg">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default'
})

const services = ref([
  { 
    id: 1, 
    title: '부분 수리', 
    description: '집의 일부분만 수리가 필요한 경우 제공하는 서비스입니다. 도어, 방문, 베란다 등 특정 부위의 수리를 전문적으로 진행합니다.',
    image: 'home-repair.jpg'
  },
  { 
    id: 2, 
    title: '전장 설치', 
    description: '전기 관련 설비를 설치하고 수리하는 서비스입니다. 조명, 스위치, 콘센트 등의 전기 장치 설치 및 교체 작업을 수행합니다.',
    image: 'home-repair.jpg'
  },
  { 
    id: 3, 
    title: '욕실 양변기 수리', 
    description: '욕실의 양변기 관련 문제를 해결하는 서비스입니다. 누수, 막힘, 부품 교체 등 양변기와 관련된 모든 수리를 제공합니다.',
    image: 'home-repair.jpg'
  },
  { 
    id: 4, 
    title: '욕실 환풍기 설치', 
    description: '욕실의 습기와 냄새를 효과적으로 제거하기 위한 환풍기 설치 서비스입니다. 적절한 환기 시스템을 구축하여 쾌적한 욕실 환경을 만듭니다.',
    image: 'home-repair.jpg'
  },
  { 
    id: 5, 
    title: '욕실 수전 교체', 
    description: '욕실의 수도꼭지(수전)를 교체하는 서비스입니다. 노후화된 수전을 새것으로 교체하여 물 사용의 효율성을 높이고 욕실의 미관을 개선합니다.',
    image: 'home-repair.jpg'
  },
  { 
    id: 6, 
    title: '욕실 전등 LED 교체', 
    description: '욕실의 기존 조명을 에너지 효율이 높은 LED 조명으로 교체하는 서비스입니다. 밝고 선명한 조명으로 욕실 환경을 개선합니다.',
    image: 'home-repair.jpg'
  },
  { 
    id: 7, 
    title: '욕실 거울수납장 설치', 
    description: '욕실에 거울과 수납 기능을 겸비한 수납장을 설치하는 서비스입니다. 공간 활용도를 높이고 욕실의 기능성을 개선합니다.',
    image: 'home-repair.jpg'
  },
  { 
    id: 8, 
    title: '전체 수리', 
    description: '집 전체에 대한 종합적인 수리 서비스입니다. 노후화된 주택의 전반적인 상태를 개선하고 새로운 모습으로 탈바꿈시킵니다.',
    image: 'home-repair.jpg'
  },
  { 
    id: 9, 
    title: '상가 수리', 
    description: '상업 공간에 대한 수리 및 리모델링 서비스입니다. 매장, 사무실 등 다양한 상업 공간의 기능성과 미관을 개선합니다.',
    image: 'home-repair.jpg'
  }
])
</script>