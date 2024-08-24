<template>
  <div class="container mx-auto px-4 py-8 max-w-[2560px]">
    <h1 class="text-3xl font-bold mb-6 dark:text-white flex items-center">
      <Icon icon="mdi:image-multiple" class="mr-2" />
      관리자 미디어 갤러리
    </h1>
    
    <GalleryList :apiEndpoint="apiEndpoint" :showComments="false" :isAdminGallery="true" />
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import GalleryList from '~/components/gallery/GalleryList.vue'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
const apiEndpoint = '/api/admingallery'

const { auth } = useAuth()
const router = useRouter()
const isAdmin = ref(false)

onMounted(() => {
  if (!auth.value.isLoggedIn || auth.value.user?.role !== 'ADMIN') {
    router.push('/')
  } else {
    isAdmin.value = true
  }
})


</script>