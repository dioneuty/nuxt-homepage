<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 dark:text-white flex items-center">
      <Icon icon="mdi:text-box-edit-outline" class="mr-2" />
      위키 마크 문법 가이드
    </h1>
    
    <div class="space-y-8">
      <section v-for="(section, index) in syntaxSections" :key="index" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-semibold mb-4 dark:text-white">{{ section.title }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded">
            <h3 class="text-lg font-medium mb-2 dark:text-white">마크 문법</h3>
            <pre class="whitespace-pre-wrap text-sm">{{ section.syntax }}</pre>
          </div>
          <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded">
            <h3 class="text-lg font-medium mb-2 dark:text-white">결과</h3>
            <div v-html="section.result" class="prose dark:prose-invert max-w-none"></div>
          </div>
        </div>
      </section>
    </div>

    <div class="mt-8 text-center">
      <NuxtLink v-if="auth.isLoggedIn && auth.user" to="/wiki/edit" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center">
        <Icon icon="mdi:pencil" class="mr-2" />
        위키 작성하기
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useAuth } from '~/composables/useAuth'

const { auth } = useAuth()

const syntaxSections = ref([
  {
    title: '제목',
    syntax: '# 대제목\n## 중제목\n### 소제목',
    result: '<h1>대제목</h1><h2>중제목</h2><h3>소제목</h3>'
  },
  {
    title: '텍스트 스타일',
    syntax: '**굵은 글씨**\n*기울임체*\n~~취소선~~',
    result: '<strong>굵은 글씨</strong><br><em>기울임체</em><br><del>취소선</del>'
  },
  {
    title: '목록',
    syntax: '- 항목 1\n- 항목 2\n  - 하위 항목\n\n1. 첫 번째\n2. 두 번째',
    result: '<ul><li>항목 1</li><li>항목 2<ul><li>하위 항목</li></ul></li></ul><ol><li>첫 번째</li><li>두 번째</li></ol>'
  },
  {
    title: '링크',
    syntax: '[링크 텍스트](https://example.com)\n[[내부 위키 링크]]',
    result: '<a href="https://example.com">링크 텍스트</a><br><a href="/wiki/view?title=내부 위키 링크">내부 위키 링크</a>'
  },
  {
    title: '이미지',
    syntax: '![대체 텍스트](https://example.com/image.jpg)',
    result: '<img src="https://example.com/image.jpg" alt="대체 텍스트">'
  },
  {
    title: '인용',
    syntax: '> 인용문\n>> 중첩된 인용문',
    result: '<blockquote><p>인용문</p><blockquote><p>중첩된 인용문</p></blockquote></blockquote>'
  },
  {
    title: '코드',
    syntax: '`인라인 코드`\n\n```\n코드 블록\n여러 줄 가능\n```',
    result: '<code>인라인 코드</code><br><pre><code>코드 블록\n여러 줄 가능</code></pre>'
  },
  {
    title: '표',
    syntax: '| 제목 1 | 제목 2 |\n|--------|--------|\n| 내용 1 | 내용 2 |',
    result: '<table><thead><tr><th>제목 1</th><th>제목 2</th></tr></thead><tbody><tr><td>내용 1</td><td>내용 2</td></tr></tbody></table>'
  }
])
</script>