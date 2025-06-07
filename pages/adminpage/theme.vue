<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4 dark:text-white">테마 설정</h2>
    <p class="dark:text-gray-300">웹사이트의 헤더, 푸터, 배경 색상을 라이트 모드와 다크 모드에 따라 설정합니다.</p>

    <div class="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h3 class="text-xl font-semibold mb-4 dark:text-white">색상 설정</h3>
      <div class="space-y-4">
        <div>
          <label for="lightHeaderColor" class="block text-sm font-medium text-gray-700 dark:text-gray-300">라이트 모드 헤더 색상:</label>
          <input 
            type="color" 
            id="lightHeaderColor" 
            v-model="lightHeaderColor" 
            class="mt-1 block w-24 h-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label for="darkHeaderColor" class="block text-sm font-medium text-gray-700 dark:text-gray-300">다크 모드 헤더 색상:</label>
          <input 
            type="color" 
            id="darkHeaderColor" 
            v-model="darkHeaderColor" 
            class="mt-1 block w-24 h-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label for="lightFooterColor" class="block text-sm font-medium text-gray-700 dark:text-gray-300">라이트 모드 푸터 색상:</label>
          <input 
            type="color" 
            id="lightFooterColor" 
            v-model="lightFooterColor" 
            class="mt-1 block w-24 h-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label for="darkFooterColor" class="block text-sm font-medium text-gray-700 dark:text-gray-300">다크 모드 푸터 색상:</label>
          <input 
            type="color" 
            id="darkFooterColor" 
            v-model="darkFooterColor" 
            class="mt-1 block w-24 h-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label for="lightBackgroundColor" class="block text-sm font-medium text-gray-700 dark:text-gray-300">라이트 모드 배경 색상:</label>
          <input 
            type="color" 
            id="lightBackgroundColor" 
            v-model="lightBackgroundColor" 
            class="mt-1 block w-24 h-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label for="darkBackgroundColor" class="block text-sm font-medium text-gray-700 dark:text-gray-300">다크 모드 배경 색상:</label>
          <input 
            type="color" 
            id="darkBackgroundColor" 
            v-model="darkBackgroundColor" 
            class="mt-1 block w-24 h-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button 
          @click="saveThemeSettings" 
          class="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          설정 저장
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from '~/composables/useToast';

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
});

useHead({
  title: '테마 설정'
});

const lightHeaderColor = ref('#FFFFFF');
const darkHeaderColor = ref('#1A202C'); 
const lightFooterColor = ref('#F7FAFC'); 
const darkFooterColor = ref('#1A202C'); 
const lightBackgroundColor = ref('#FFFFFF');
const darkBackgroundColor = ref('#1A202C');

const { showToast } = useToast();

const fetchThemeSettings = async () => {
  try {
    const { data } = await useFetch('/api/admin/theme-settings');
    if (data.value) {
      lightHeaderColor.value = data.value.lightHeaderColor || '#FFFFFF';
      darkHeaderColor.value = data.value.darkHeaderColor || '#1A202C';
      lightFooterColor.value = data.value.lightFooterColor || '#F7FAFC';
      darkFooterColor.value = data.value.darkFooterColor || '#1A202C';
      lightBackgroundColor.value = data.value.lightBackgroundColor || '#FFFFFF';
      darkBackgroundColor.value = data.value.darkBackgroundColor || '#1A202C';
    }
  } catch (error) {
    console.error('테마 설정 불러오기 실패:', error);
  }
};

const saveThemeSettings = async () => {
  try {
    await useFetch('/api/admin/theme-settings', {
      method: 'PUT',
      body: {
        lightHeaderColor: lightHeaderColor.value,
        darkHeaderColor: darkHeaderColor.value,
        lightFooterColor: lightFooterColor.value,
        darkFooterColor: darkFooterColor.value,
        lightBackgroundColor: lightBackgroundColor.value,
        darkBackgroundColor: darkBackgroundColor.value,
      },
    });
    showToast('테마 설정이 성공적으로 저장되었습니다.', 'success');
  } catch (error) {
    console.error('테마 설정 저장 실패:', error);
    showToast('테마 설정 저장에 실패했습니다.', 'error');
  }
};

onMounted(() => {
  fetchThemeSettings();
});
</script> 