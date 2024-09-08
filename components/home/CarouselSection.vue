<template>
  <div class="mb-8 max-w-4xl mx-auto">
    <Carousel :images="imageMockups" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Carousel from '@/components/Carousel.vue'

const imageMockups = ref([
  'images/foods/02622-2946913328-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02627-3520537961-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02628-969862558-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02631-1493736721-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02632-1910364399-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02633-1183833072-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02635-2468241200-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02636-2010697720-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02638-138639311-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02639-3506920034-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02641-464823937-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02642-3197523906-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02644-2095761223-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02645-2150047310-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02646-277971245-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02647-2981120122-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02648-612170913-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02652-2595417360-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02654-2797699637-ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), physically-based render.webp',
  'images/foods/02658-588456811-intricate details, ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), phys.webp',
  'images/foods/02666-1339467618-intricate details, ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), phys.webp',
  'images/foods/02670-2708671754-intricate details, ultra detailed, highres, (realistic, photo-realistic_1.4), 8k, raw photo, (masterpiece), (best quality), phys.webp',
])

</script>