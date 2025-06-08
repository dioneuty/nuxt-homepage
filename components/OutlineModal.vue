<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
      <!-- Modal Header -->
      <div class="flex justify-between items-center p-4 border-b dark:border-gray-700">
        <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ title }}</h2>
        <div class="flex items-center">
          <button @click="toggleEditMode" class="p-2 mr-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors duration-300 transform active:scale-98 focus:outline-none focus:ring-0">
            <Icon :icon="isEditing ? 'mdi:eye' : 'mdi:pencil'" class="text-lg" />
          </button>
          <button @click="closeModal" class="p-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-300 transform active:scale-98 focus:outline-none focus:ring-0">
            <Icon icon="mdi:close" class="text-lg" />
          </button>
        </div>
      </div>

      <!-- Modal Body (Content) -->
      <div class="p-4 overflow-y-auto flex-grow">
        <CommonQuillEditor
          v-if="isEditing"
          :value="content"
          @input="updateContent"
          placeholder="내용을 입력하세요..."
        />
        <OutlineDetailViewer
          v-else
          :content="content"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import CommonQuillEditor from '~/components/CommonQuillEditor.vue';
import OutlineDetailViewer from '~/components/OutlineDetailViewer.vue';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  content: {
    type: String,
    default: '',
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'update:content', 'toggle:editMode']);

function closeModal() {
  emit('close');
}

function updateContent(newContent) {
  emit('update:content', newContent);
}

function toggleEditMode() {
  emit('toggle:editMode');
}
</script>

<style scoped>
/* Add any specific modal styles here if needed, otherwise Tailwind handles most. */
</style> 