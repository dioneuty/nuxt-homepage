<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-8 text-center text-blue-600 dark:text-blue-400">웹 개발자 소개</h1>
    
    <div class="grid md:grid-cols-2 gap-8 mb-12">
      <div>
        <h2 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">전문 웹 개발자</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          2014년부터 웹 개발을 시작하여 현재는 프리랜서로 활동하고 있습니다. 
          다양한 프로젝트 경험을 바탕으로 최신 기술 트렌드를 따라가며 
          고객의 요구사항에 맞는 최적의 웹 솔루션을 제공합니다.
        </p>
        <ul class="list-disc list-inside text-gray-600 dark:text-gray-400">
          <li>프론트엔드 및 백엔드 개발</li>
          <li>반응형 웹 디자인</li>
          <li>최신 프레임워크 활용</li>
          <li>성능 최적화 및 보안 강화</li>
        </ul>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <img src="/images/home-repair.jpg" alt="코딩 이미지 1" class="rounded-lg shadow-md">
        <img src="/images/home-repair.jpg" alt="코딩 이미지 2" class="rounded-lg shadow-md">
        <img src="/images/home-repair.jpg" alt="코딩 이미지 3" class="rounded-lg shadow-md">
        <img src="/images/home-repair.jpg" alt="코딩 이미지 4" class="rounded-lg shadow-md">
      </div>
    </div>

    <div class="mb-12">
      <h2 class="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-200">개발 여정</h2>
      <div class="relative">
        <div class="absolute h-full w-1 bg-blue-200 left-1/2 transform -translate-x-1/2"></div>
        <div class="relative z-10">
          <div v-for="(item, index) in historyItems" :key="index" 
               class="mb-8 flex justify-between items-center w-full"
               :class="index % 2 === 0 ? 'flex-row-reverse' : ''">
            <div class="order-1 w-5/12"></div>
            <div class="z-20 flex items-center order-1 bg-blue-500 shadow-xl w-8 h-8 rounded-full">
              <h1 class="mx-auto font-semibold text-lg text-white">{{ index + 1 }}</h1>
            </div>
            <div class="order-1 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-xl w-5/12 px-6 py-4">
              <h3 class="mb-3 font-bold text-gray-800 dark:text-gray-200 text-xl">{{ item.year }}</h3>
              <p class="text-sm leading-snug tracking-wide text-gray-600 dark:text-gray-400 text-opacity-100">{{ item.event }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mb-12">
      <h2 class="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-200">주요 기술 스택</h2>
      <p class="text-center text-gray-600 dark:text-gray-400 mb-4">
        HTML5, CSS3, JavaScript, TypeScript, React, Vue.js, Node.js
      </p>
      <p class="text-center text-gray-600 dark:text-gray-400 mb-4">
        Express.js, MongoDB, PostgreSQL, AWS, Docker, Git
      </p>
    </div>

    <div class="text-center">
      <h2 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">프로젝트 문의</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        새로운 웹 프로젝트나 기존 웹사이트 개선에 대해 상담해 드립니다.
      </p>
      <p class="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">
        이메일: developer@example.com
      </p>
      <NuxtLink to="/contact" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
        문의하기
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const historyItems = [
  { year: '2014', event: '웹 개발 학습 시작' },
  { year: '2015', event: '첫 웹사이트 프로젝트 완성' },
  { year: '2017', event: '프론트엔드 개발자로 첫 취업' },
  { year: '2019', event: '풀스택 개발자로 역량 확장' },
  { year: '2021', event: '프리랜서 개발자로 전환' },
  { year: '2023', event: '다수의 성공적인 프로젝트 완료' },
]

definePageMeta ({
  title: '웹 개발자 소개 - Dion',
  meta: [
    { name: 'description', content: 'Dion' },
    { name: 'keywords', content: 'Dion' }
  ],
  static: true
})

</script>