<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-8 text-center text-blue-600 dark:text-blue-400">블루드릴 집수리 소개</h1>
    
    <div class="grid md:grid-cols-2 gap-8 mb-12">
      <div>
        <h2 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">전문적인 집수리 서비스</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          블루드릴은 고객님의 소중한 집을 안전하고 아름답게 만들어드립니다. 
          수리는 완벽하고 깔끔하게, 방법은 정석으로 진행합니다.
          그럼에도 가격은 그대로, 최신 장비 총동원!!
        </p>
        <ul class="list-disc list-inside text-gray-600 dark:text-gray-400">
          <li>전문적인 기술력</li>
          <li>신속하고 정확한 서비스</li>
          <li>합리적인 가격</li>
          <li>친절한 고객 서비스</li>
        </ul>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <img src="/images/home-repair.jpg" alt="집수리 이미지 1" class="rounded-lg shadow-md">
        <img src="/images/home-repair.jpg" alt="집수리 이미지 2" class="rounded-lg shadow-md">
        <img src="/images/home-repair.jpg" alt="집수리 이미지 3" class="rounded-lg shadow-md">
        <img src="/images/home-repair.jpg" alt="집수리 이미지 4" class="rounded-lg shadow-md">
      </div>
    </div>

    <div class="mb-12">
      <h2 class="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-200">BLUE DRILL의 역사</h2>
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
      <h2 class="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-200">서비스 지역</h2>
      <p class="text-center text-gray-600 dark:text-gray-400 mb-4">
        서울 강동구 송파구 광진구 구리시 하남시 팔당 다산
      </p>
      <p class="text-center text-gray-600 dark:text-gray-400 mb-4">
        강남구, 성동구, 동대문구, 중랑구, 양평읍, 화도읍, 진접읍, 퇴계원, 의정부, 포천, 양주, 퇴촌, 호평, 오남읍, 마석
      </p>
    </div>

    <div class="text-center">
      <h2 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">지금 바로 문의하세요!</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        블루드릴과 함께 더 안전하고 아름다운 집을 만들어보세요.
      </p>
      <p class="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">
        문의전화: 010-xxxx-xxxx
      </p>
      <NuxtLink to="/contact" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
        문의하기
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const historyItems = [
  { year: '2010', event: 'BLUE DRILL 설립' },
  { year: '2013', event: '지역 최우수 집수리 업체 선정' },
  { year: '2015', event: '청소년 직업 교육 기관 선정' },
  { year: '2018', event: '전국 최우수 집수리 업체 선정' },
  { year: '2020', event: '대통령 표창 수상' },
  { year: '2023', event: '대통령 표창 수상2' },
]

definePageMeta({
  layout: 'default'
})
</script>