<template>
  <ClientOnly>
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
import { ref, onMounted } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const quillInstance = ref(null)

const props = defineProps({
  value: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '내용을 입력하세요...',
  },
})

const emit = defineEmits(['input', 'blur', 'focus', 'ready', 'change'])

const editorOptions = ref({
  theme: 'snow',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image', 'video']
    ],
    // 마크다운 단축키 모듈을 여기에 추가할 예정
  },
  placeholder: props.placeholder,
})

onMounted(async () => {
  if (process.client) {
    const MarkdownShortcuts = await import('quill-markdown-shortcuts')
    editorOptions.value.modules.markdownShortcuts = true
    editorOptions.value.modules.clipboard = {
      matchVisual: false
    }
  }
})

function onContentUpdate(content) {
  emit('input', content)
}

function onEditorBlur(quill) {
  emit('blur', quill)
}

function onEditorFocus(quill) {
  emit('focus', quill)
}

function onEditorReady(quill) {
  quillInstance.value = quill
  emit('ready', quill)
}

function onEditorChange({ html, text, quill }) {
  emit('input', html)
  emit('change', { html, text, quill })
}
</script>

<style>
/* ql-video 클래스 스타일 - 모바일, 데스크톱에 따라 자동 크기 조정 */
.ql-video {
  width: 100%;
  max-width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
}

@media (min-width: 768px) {
  .ql-video {
    width: 768px;
    aspect-ratio: 16 / 9;
  }
}

.ql-editor {
  min-height: 200px;
}
</style>