<template>
    <div class="wiki-page">
      <h1 class="text-2xl font-bold mb-4">{{ title }}</h1>
      <div v-html="content" class="wiki-content"></div>
      <div class="mt-4">
        <button @click="editPage" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2">
          <Icon icon="mdi:pencil" class="mr-2" />
          편집
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { Icon } from '@iconify/vue'
  
  const props = defineProps({
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    }
  })
  
  const emit = defineEmits(['edit'])
  
  const editPage = () => {
    emit('edit')
  }
  </script>