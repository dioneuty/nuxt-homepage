<template>
  <footer class="text-white py-4 hidden md:block" :style="{ backgroundColor: footerColor }">
    <div class="container mx-auto px-4 text-center">
      <p>&copy; 이 웹사이트는 Nuxt.js 3 (Vue.js 3), Supabase, Tailwind CSS, Vercel 등을 사용하여 제작되었습니다.</p>
    </div>
  </footer>
</template>

<script setup>
defineProps({
  footerColor: {
    type: String,
    default: '#333333' // Default dark grey if not provided
  }
});
</script>