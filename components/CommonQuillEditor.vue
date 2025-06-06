<template>
  <!-- 클라이언트 사이드에서만 렌더링되도록 ClientOnly 컴포넌트 사용 -->
  <ClientOnly>
    <!-- QuillEditor 컴포넌트 - 텍스트 에디터 구현 -->
    <QuillEditor
      :content="value"
      content-type="html"
      @update:content="onContentUpdate"
      :options="editorOptions"
      @blur="onEditorBlur"
      @focus="onEditorFocus"
      @ready="onEditorReady"
      @change="onEditorChange"
    />
  </ClientOnly>
</template>

<script setup>
// Vue Quill 에디터 컴포넌트와 스타일 import
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

// props 정의
const props = defineProps({
  value: {
    type: String,
    default: '', // 기본값은 빈 문자열
  },
  placeholder: {
    type: String,
    default: '내용을 입력하세요...', // 플레이스홀더 기본 텍스트
  },
})

// 이벤트 emit 정의
const emit = defineEmits(['input', 'blur', 'focus', 'ready', 'change'])

// Quill 에디터 설정 옵션
const editorOptions = {
  theme: 'snow', // 스노우 테마 사용
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'], // 텍스트 스타일 옵션
      ['blockquote', 'code-block'], // 인용구와 코드 블록
      [{ 'header': 1 }, { 'header': 2 }], // 헤더 스타일
      [{ 'list': 'ordered' }, { 'list': 'bullet' }], // 순서 있는/없는 목록
      [{ 'script': 'sub' }, { 'script': 'super' }], // 아래/위 첨자
      [{ 'indent': '-1' }, { 'indent': '+1' }], // 들여쓰기 조절
      [{ 'direction': 'rtl' }], // 텍스트 방향
      [{ 'size': ['small', false, 'large', 'huge'] }], // 글자 크기
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }], // 헤더 레벨
      [{ 'color': [] }, { 'background': [] }], // 글자색, 배경색
      [{ 'font': [] }], // 폰트 종류
      [{ 'align': [] }], // 정렬
      ['clean'], // 서식 제거
      ['link', 'image', 'video'] // 링크, 이미지, 비디오 삽입
    ]
  },
  placeholder: props.placeholder, // 플레이스홀더 설정
}

// 컨텐츠 업데이트 이벤트 핸들러
function onContentUpdate(content) {
  emit('input', content)
}

// 에디터 블러(포커스 아웃) 이벤트 핸들러
function onEditorBlur(quill) {
  emit('blur', quill)
}

// 에디터 포커스 이벤트 핸들러
function onEditorFocus(quill) {
  emit('focus', quill)
}

// 에디터 준비 완료 이벤트 핸들러
function onEditorReady(quill) {
  emit('ready', quill)
}

// 에디터 내용 변경 이벤트 핸들러
function onEditorChange({ html, text, quill }) {
  emit('input', html)
  emit('change', { html, text, quill })
}
</script>

<style>
/* 비디오 요소의 반응형 스타일 설정 */
.ql-video {
  width: 100%;
  max-width: 100%;
  height: auto;
  aspect-ratio: 16 / 9; /* 16:9 비율 유지 */
}

/* 태블릿/데스크톱 화면에서의 비디오 크기 설정 */
@media (min-width: 768px) {
  .ql-video {
    width: 768px;
    aspect-ratio: 16 / 9;
  }
}
</style>