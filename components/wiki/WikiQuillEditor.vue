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

const onReady = (quill) => {
  quillInstance.value = quill;
  // 커스텀 이미지 핸들러를 여기에 할당합니다.
  quill.getModule('toolbar').addHandler('image', imageHandler);
  emit('ready', quill);
};

/**
 * Quill 에디터의 커스텀 이미지 핸들러입니다.
 * 파일 선택 창을 열고, 선택된 이미지를 base64로 읽어 에디터에 삽입합니다.
 */
function imageHandler() {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');
  input.setAttribute('multiple', true);
  input.click();

  input.onchange = () => {
    const files = input.files;
    if (files && quillInstance.value) {
      const quill = quillInstance.value;
      const range = quill.getSelection(true);
      const readFilesAsBase64 = Array.from(files).map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = e => resolve(e.target.result);
          reader.onerror = err => reject(err);
          reader.readAsDataURL(file);
        });
      });
      Promise.all(readFilesAsBase64)
        .then(images => {
          images.forEach(base64Image => {
            quill.insertEmbed(range.index, 'image', base64Image);
            range.index += 1;
          });
          quill.insertText(range.index, '\n');
          quill.setSelection(range.index + 1, 0);
        })
        .catch(error => console.error('Error reading files:', error));
    }
  };
}

/**
 * 에디터 내용이 업데이트될 때 호출되는 함수입니다.
 * 'input' 이벤트를 발생시켜 업데이트된 HTML 콘텐츠를 부모 컴포넌트로 전달합니다.
 * @param {string} content - 업데이트된 HTML 콘텐츠.
 */
function onContentUpdate(content) { emit('input', content); }

/**
 * 에디터가 블러(focus out)될 때 호출되는 함수입니다.
 * 'blur' 이벤트를 발생시켜 Quill 인스턴스를 부모 컴포넌트로 전달합니다.
 * @param {object} quill - Quill 에디터 인스턴스.
 */
function onEditorBlur(quill) { emit('blur', quill); }

/**
 * 에디터가 포커스(focus in)될 때 호출되는 함수입니다.
 * 'focus' 이벤트를 발생시켜 Quill 인스턴스를 부모 컴포넌트로 전달합니다.
 * @param {object} quill - Quill 에디터 인스턴스.
 */
function onEditorFocus(quill) { emit('focus', quill); }

/**
 * 에디터 내용이 변경될 때 호출되는 함수입니다.
 * 'input' 및 'change' 이벤트를 발생시켜 업데이트된 HTML, 텍스트 콘텐츠 및 Quill 인스턴스를 부모 컴포넌트로 전달합니다.
 * @param {object} payload - 변경된 내용과 Quill 인스턴스를 포함하는 객체 ({ html, text, quill }).
 */
function onEditorChange({ html, text, quill }) {
  emit('input', html);
  emit('change', { html, text, quill });
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