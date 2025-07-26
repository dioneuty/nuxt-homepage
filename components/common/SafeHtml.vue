<template>
  <div v-html="sanitizedContent" :class="containerClass"></div>
</template>

<script setup>
import { computed } from 'vue'
import { useSafeHtml } from '~/composables/useSafeHtml'

// Props 정의
const props = defineProps({
  // 렌더링할 HTML 콘텐츠
  content: {
    type: String,
    default: ''
  },
  
  // 새니타이저 타입
  type: {
    type: String,
    default: 'basic',
    validator: (value) => [
      'basic',      // 기본 텍스트 (p, br, strong, em 등)
      'rich',       // 블로그/게시판 리치 콘텐츠
      'gallery',    // 갤러리 이미지
      'youtube',    // 유튜브 embed
      'markdown'    // 마크다운 렌더링 결과
    ].includes(value)
  },
  
  // 컨테이너 CSS 클래스
  containerClass: {
    type: String,
    default: ''
  },
  
  // 커스텀 새니타이저 옵션
  customOptions: {
    type: Object,
    default: () => ({})
  }
})

// 안전한 HTML 새니타이저 사용
const { 
  sanitizeBasicHtml,
  sanitizeRichContent, 
  sanitizeGalleryHtml, 
  sanitizeYouTubeEmbed,
  sanitizeMarkdown,
  sanitizeHtml
} = useSafeHtml()

// 타입별 새니타이즈된 콘텐츠 생성
const sanitizedContent = computed(() => {
  if (!props.content) return ''
  
  switch (props.type) {
    case 'rich':
      return sanitizeRichContent(props.content)
    case 'gallery':
      return sanitizeGalleryHtml(props.content)
    case 'youtube':
      return sanitizeYouTubeEmbed(props.content)
    case 'markdown':
      return sanitizeMarkdown(props.content)
    case 'basic':
      return sanitizeBasicHtml(props.content)
    default:
      // 커스텀 옵션이 있으면 사용
      return Object.keys(props.customOptions).length > 0 
        ? sanitizeHtml(props.content, props.customOptions)
        : sanitizeBasicHtml(props.content)
  }
})
</script>

<style scoped>
/* 새니타이즈된 콘텐츠 기본 스타일 */
:deep(img) {
  max-width: 100%;
  height: auto;
}

:deep(iframe) {
  max-width: 100%;
}

:deep(pre) {
  white-space: pre-wrap;
  word-wrap: break-word;
}

:deep(code) {
  padding: 2px 4px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

:deep(blockquote) {
  border-left: 4px solid #ddd;
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
}
</style>