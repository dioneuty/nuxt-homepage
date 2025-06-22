<template>
  <div class="prose dark:prose-invert max-w-none" ref="viewerContent"></div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';
import { Icon } from '@iconify/vue';
import { useIsMobile } from '~/composables/useIsMobile';

const props = defineProps({
  content: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['openYoutubeModal']);

const viewerContent = ref(null); // Template ref for the main div
const { isMobile } = useIsMobile();

const addFullscreenButton = () => {
  if (!viewerContent.value) return;

  // Remove any existing fullscreen buttons to prevent duplicates on content change
  viewerContent.value.querySelectorAll('.youtube-fullscreen-wrapper').forEach(wrapper => {
    // Move the iframe back to its original position before removing the wrapper
    const iframe = wrapper.querySelector('iframe');
    if (iframe) {
      wrapper.parentNode.insertBefore(iframe, wrapper);
    }
    wrapper.remove();
  });

  const iframes = viewerContent.value.querySelectorAll('iframe.ql-video');

  iframes.forEach(iframe => {
    const src = iframe.getAttribute('src');
    const youtubeMatch = src.match(/(?:https?:\/\/(?:www\.)?youtube\.com\/(?:embed\/|watch\?v=)|https?:\/\/youtu\.be\/)([a-zA-Z0-9_-]{11})/);

    if (youtubeMatch && youtubeMatch[1]) {
      const videoId = youtubeMatch[1];

      const wrapper = document.createElement('div');
      wrapper.className = 'relative mb-4 youtube-fullscreen-wrapper'; // Add a class for easy removal
      wrapper.style.paddingBottom = '56.25%'; // 16:9 Aspect Ratio
      wrapper.style.height = '0';
      wrapper.style.overflow = 'hidden';
      wrapper.style.maxWidth = '100%';
      wrapper.style.background = 'black'; // Ensure black background for aspect ratio filler

      iframe.style.position = 'absolute';
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.width = '100%';
      iframe.style.height = '100%';

      // Create fullscreen button
      const button = document.createElement('button');
      button.className = 'absolute bottom-2 right-2 p-2 bg-gray-800 bg-opacity-75 text-white rounded-full transition-opacity duration-300 hover:opacity-100 opacity-0 group-hover:opacity-100 z-10';
      button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M5 19h4v-2H5v-4H3v6zm-2-8h2V7h4V5H3v6zm16 8v-4h-2v4h-4v2h6zm-2-12h-4V5h4v4z"/></svg>'; // Fullscreen icon
      button.title = '크게 보기';

      // Only show button on desktop
      if (isMobile.value) {
        button.style.display = 'none';
      }

      button.onclick = () => {
        emit('openYoutubeModal', videoId);
      };

      // Wrap iframe and add button
      iframe.parentNode.insertBefore(wrapper, iframe);
      wrapper.appendChild(iframe);
      wrapper.appendChild(button);

      // Add group-hover for button opacity transition
      wrapper.classList.add('group');
    }
  });
};

onMounted(() => {
  viewerContent.value.innerHTML = props.content;
  nextTick(() => {
    addFullscreenButton();
  });
});

watch(() => props.content, (newContent) => {
  viewerContent.value.innerHTML = newContent;
  nextTick(() => {
    addFullscreenButton();
  });
});
</script>

<style scoped>
/* Tailwind prose 클래스가 대부분의 스타일을 처리합니다. */
/* 필요한 경우 추가 스타일을 여기에 정의할 수 있습니다. */
.youtube-fullscreen-wrapper:hover .group-hover\:opacity-100 {
  opacity: 1;
}
</style> 