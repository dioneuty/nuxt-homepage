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