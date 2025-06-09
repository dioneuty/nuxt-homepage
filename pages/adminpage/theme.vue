<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4 dark:text-white">테마 설정</h2>
    <p class="dark:text-gray-300">웹사이트의 헤더, 푸터, 배경 색상을 라이트 모드와 다크 모드에 따라 설정합니다.</p>

    <div class="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h3 class="text-xl font-semibold mb-4 dark:text-white">사이트 기본 설정</h3>
      <div class="space-y-4 mb-8">
        <div>
          <label for="siteTitle" class="block text-sm font-medium text-gray-700 dark:text-gray-300">사이트 제목:</label>
          <input 
            type="text" 
            id="siteTitle" 
            v-model="siteTitle" 
            class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="예: My Awesome Website"
          />
        </div>
        <div>
          <label for="siteLogoUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300">사이트 로고 URL:</label>
          <input 
            type="text" 
            id="siteLogoUrl" 
            v-model="siteLogoUrl" 
            class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="예: /images/logo.png"
          />
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">로고 이미지의 경로를 입력하세요.</p>
        </div>
        <div>
          <label for="siteLogoIcon" class="block text-sm font-medium text-gray-700 dark:text-gray-300">사이트 로고 아이콘 (Heroicons):</label>
          <div class="flex items-center space-x-2 mt-1">
            <button
              @click="isIconPickerModalOpen = true"
              type="button"
              class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              아이콘 선택
            </button>
            <div v-if="siteLogoIcon" class="flex items-center space-x-2 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
              <Icon :icon="siteLogoIcon" class="h-6 w-6 text-gray-800 dark:text-gray-200" />
              <span class="text-gray-700 dark:text-gray-300 text-sm">{{ siteLogoIcon }}</span>
              <button @click="clearSiteLogoIcon" class="ml-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400">
                <Icon icon="heroicons-outline:x-mark" class="h-4 w-4" />
              </button>
            </div>
            <span v-else class="text-sm text-gray-500 dark:text-gray-400">선택된 아이콘 없음</span>
          </div>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">사이트 로고로 사용할 Heroicons를 선택하세요.</p>
        </div>

        <!-- Show Site Title Toggle -->
        <div class="flex items-center justify-between">
          <label for="showSiteTitle" class="block text-sm font-medium text-gray-700 dark:text-gray-300">사이트 제목 표시:</label>
          <input type="checkbox" id="showSiteTitle" v-model="showSiteTitle" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-blue-600">
        </div>

        <!-- Show Site Logo URL Toggle -->
        <div class="flex items-center justify-between">
          <label for="showSiteLogoUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300">사이트 로고 URL 표시:</label>
          <input type="checkbox" id="showSiteLogoUrl" v-model="showSiteLogoUrl" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-blue-600">
        </div>

        <!-- Show Site Logo Icon Toggle -->
        <div class="flex items-center justify-between">
          <label for="showSiteLogoIcon" class="block text-sm font-medium text-gray-700 dark:text-gray-300">사이트 로고 아이콘 표시:</label>
          <input type="checkbox" id="showSiteLogoIcon" v-model="showSiteLogoIcon" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-blue-600">
        </div>

      </div>

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
  <HeroiconPickerModal :is-open="isIconPickerModalOpen" @update:is-open="isIconPickerModalOpen = $event" @select-icon="handleIconSelected" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from '~/composables/useToast';
import { Icon } from '@iconify/vue';
import HeroiconPickerModal from '~/components/common/HeroiconPickerModal.vue';

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
const siteTitle = ref('');
const siteLogoUrl = ref('');
const siteLogoIcon = ref(null);
const showSiteTitle = ref(true);
const showSiteLogoUrl = ref(true);
const showSiteLogoIcon = ref(true);
const isIconPickerModalOpen = ref(false);

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
      siteTitle.value = data.value.siteTitle || '';
      siteLogoUrl.value = data.value.siteLogoUrl || '';
      siteLogoIcon.value = data.value.siteLogoIcon || null;
      showSiteTitle.value = data.value.showSiteTitle ?? true;
      showSiteLogoUrl.value = data.value.showSiteLogoUrl ?? true;
      showSiteLogoIcon.value = data.value.showSiteLogoIcon ?? true;
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
        siteTitle: siteTitle.value,
        siteLogoUrl: siteLogoUrl.value,
        siteLogoIcon: siteLogoIcon.value,
        showSiteTitle: showSiteTitle.value,
        showSiteLogoUrl: showSiteLogoUrl.value,
        showSiteLogoIcon: showSiteLogoIcon.value,
      },
    });
    showToast('테마 설정이 성공적으로 저장되었습니다.', 'success');
  } catch (error) {
    console.error('테마 설정 저장 실패:', error);
    showToast('테마 설정 저장에 실패했습니다.', 'error');
  }
};

const handleIconSelected = (iconName) => {
  siteLogoIcon.value = iconName;
  isIconPickerModalOpen.value = false;
};

const clearSiteLogoIcon = () => {
  siteLogoIcon.value = null;
};

onMounted(() => {
  fetchThemeSettings();
});
</script>

<style>
/* HeroiconPickerModal 스타일이 여기에 오지 않도록 주의. HeroiconPickerModal.vue 파일에 정의되어 있음 */
</style> 