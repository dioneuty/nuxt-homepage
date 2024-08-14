<template>
  <QuillEditor
    :content="modelValue"
    content-type="html"
    @update:content="$emit('update:modelValue', $event)"
    :options="editorOptions"
    @blur="onEditorBlur"
    @focus="onEditorFocus"
    @ready="onEditorReady"
    @change="onEditorChange"
  />
</template>

<script setup>
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '내용을 입력하세요...',
  },
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'ready', 'change'])

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
      ['link', 'image', 'video']
    ]
  },
  placeholder: props.placeholder,
}

const onEditorBlur = (quill) => emit('blur', quill)
const onEditorFocus = (quill) => emit('focus', quill)
const onEditorReady = (quill) => emit('ready', quill)
const onEditorChange = ({ html, text, quill }) => {
  emit('update:modelValue', html)
  emit('change', { html, text, quill })
}
</script>

<style>
.ql-editor .ql-video {
  width: 100%;
  height: 315px;
}
</style>