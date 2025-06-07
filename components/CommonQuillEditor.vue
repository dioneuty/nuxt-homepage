<template>
  <!-- 클라이언트 사이드에서만 렌더링되도록 ClientOnly 컴포넌트 사용 -->
  <ClientOnly>
    <!-- QuillEditor 컴포넌트 - 텍스트 에디터 구현 -->
    <QuillEditor
      ref="quillEditorRef"
      :content="value"
      content-type="html"
      @update:content="onContentUpdate"
      :options="editorOptions"
      @blur="onEditorBlur"
      @focus="onEditorFocus"
      @ready="onReady"
      @change="onEditorChange"
    />
  </ClientOnly>
</template>

<script setup>
import { ref } from 'vue';
import { QuillEditor, Quill } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import QuillResize from 'quill-resize-module';

Quill.register('modules/resize', QuillResize);

// props 정의
const props = defineProps({
  value: { type: String, default: '' },
  placeholder: { type: String, default: '내용을 입력하세요...' },
});

// 이벤트 emit 정의
const emit = defineEmits(['input', 'blur', 'focus', 'ready', 'change']);

// Refs
const quillInstance = ref(null);

const editorOptions = {
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
      ['link', 'image', 'video'],
    ],
    resize: {
      modules: ['Resize', 'DisplaySize', 'Toolbar'],
      tools: [
        'left',
        'center',
        'right',
        {
          text: '교체',
          handler: (evt, button, activeEle) => {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.click();

            input.onchange = () => {
              const file = input.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  activeEle.setAttribute('src', e.target.result);
                };
                reader.readAsDataURL(file);
              }
            };
          }
        },
        {
          text: '삭제',
          handler: (evt, button, activeEle) => {
            if (activeEle) {
              const blot = Quill.find(activeEle);
              if (blot) {
                blot.remove();
              }
            }
          },
        },
      ],
    },
  },
  placeholder: props.placeholder,
};

const onReady = (quill) => {
  quillInstance.value = quill;
  // 커스텀 이미지 핸들러를 여기에 할당합니다.
  quill.getModule('toolbar').addHandler('image', imageHandler);
  emit('ready', quill);
};

// 커스텀 이미지 핸들러
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

// 기존 이벤트 핸들러들
function onContentUpdate(content) { emit('input', content); }
function onEditorBlur(quill) { emit('blur', quill); }
function onEditorFocus(quill) { emit('focus', quill); }
function onEditorChange({ html, text, quill }) {
  emit('input', html);
  emit('change', { html, text, quill });
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