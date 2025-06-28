<template>
  <div :class="mainContainerClasses">
    <!-- 아웃라이너 섹션 -->
    <div :class="outlinerSectionClasses">
      <h1 class="text-3xl text-gray-800 dark:text-gray-200 mb-5 text-center">아웃라이너</h1>
      <!-- 버튼 -->
      <div class="flex justify-between mb-5" ref="headerButtonsRef">
        <button @click="addItem(null)" class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors duration-300 transform active:scale-98">
          <Icon icon="mdi:plus" /> 최상위 항목 추가
        </button>
        <button @click="zoomOut" v-if="zoomPath.length > 0" class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors duration-300 transform active:scale-98">
          <Icon icon="mdi:arrow-collapse-all" /> 확대 해제
        </button>
        <button @click="saveAllItems" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors duration-300 transform active:scale-98">
          <Icon icon="mdi:content-save-all-outline" /> 모두 저장
        </button>
        <!-- 너비 전환 버튼 (전체 너비/컨테이너 너비) -->
        <button v-if="!isMobile" @click="toggleWidth" class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors duration-300 transform active:scale-98">
          <Icon :icon="isFullWidth ? 'mdi:arrow-collapse-horizontal' : 'mdi:arrow-expand-horizontal'" />
          {{ isFullWidth ? '컨테이너 너비' : '전체 너비' }}
        </button>
        <!-- 비율 조절 버튼 (아웃라이너:상세) -->
        <button v-if="!isMobile && selectedItem" @click="toggleLayoutRatio" class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors duration-300 transform active:scale-98 ml-2">
          <Icon icon="mdi:arrow-split-vertical" />
          {{ currentLayoutRatio }}
        </button>
        <!-- 스크롤 잠금 토글 버튼 -->
        <button v-if="!isMobile" @click="toggleScrollLock" class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors duration-300 transform active:scale-98 ml-2">
          <Icon :icon="isScrollLocked ? 'mdi:lock' : 'mdi:lock-open'" />
        </button>
      </div>
      <!-- 확대 경로 -->
      <div class="mb-2.5 text-sm" v-if="zoomPath.length > 0">
        <span>
          <a @click="zoomTo(-1)" class="text-blue-500 dark:text-blue-400 cursor-pointer hover:underline">최상단</a>
        </span>
        <span v-for="(item, index) in zoomPath" :key="item.id">
          <span class="mx-1.5 text-gray-500 dark:text-gray-400"> > </span>
          <a @click="zoomTo(index)" class="text-blue-500 dark:text-blue-400 cursor-pointer hover:underline">{{ item.content }}</a>
        </span>
      </div>
      <!-- 아웃라이너 -->
      <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-5 shadow-sm" :style="outlinerContainerStyle">
        <!-- 드래그 가능한 아웃라이너 항목 -->
        <draggable
          v-model="currentItems"
          item-key="id"
          @change="handleReorder"
          ghost-class="ghost"
          :animation="200"
          :group="{ name: 'outline-group', pull: true, put: true }"
          :move="(evt) => checkDragMove(evt, 0)"
          @start="handleDragStart"
          @end="handleDragEnd"
        >
          <template #item="{ element }">
            <OutlineItem
              :item="element"
              :depth="0"
              :siblings="currentItems"
              @toggle="toggleItem"
              @zoom="zoomToItem"
              @add="addItem"
              @delete="deleteItem"
              @update="updateItem"
              @indent="indentItem"
              @outdent="outdentItem"
              @reorder="handleReorder"
              @itemSelected="handleItemSelected"
              @addAbove="addAboveItem"
              @addBelow="addBelowItem"
              @rename="updateItem"
              @duplicate="duplicateItem"
              @cut="cutItem"
              @copy="copyItem"
              @paste="pasteItem"
              @showDetail="handleShowDetail"
              :checkDragMove="checkDragMove"
              :draggingItem="draggingItem"
              :handleDragStart="handleDragStart"
              :handleDragEnd="handleDragEnd"
              :isClipboardNotEmpty="isClipboardNotEmpty"
              :potentialHierarchyChange="potentialHierarchyChange"
              :isMobile="isMobile"
            />
          </template>
        </draggable>
      </div>
    </div>

    <!-- 데스크톱 상세 화면 섹션 -->
    <div v-if="selectedItem && !isMobile" :class="detailSectionClasses">
      <div class="bg-gray-100 dark:bg-gray-700 rounded-lg px-5 pb-5 pt-0 shadow-sm" :style="detailContainerStyle">
        <h2 class="text-2xl text-gray-800 dark:text-gray-200 mb-3 text-center mt-0" v-if="selectedItem">{{ selectedItem.content }}</h2>
        <div class="flex justify-center items-center mb-3">
          <button @click="toggleEditMode" v-if="selectedItem" class="px-2 py-1 mr-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors duration-300 transform active:scale-98 focus:outline-none focus:ring-0">
            <Icon :icon="isDetailEditing ? 'mdi:eye' : 'mdi:pencil'" class="text-lg" />
          </button>
          <button @click="closeDetail" class="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-300 transform active:scale-98 focus:outline-none focus:ring-0">
            <Icon icon="mdi:close" class="text-lg" />
          </button>
        </div>
        <CommonQuillEditor
          v-if="selectedItem && isDetailEditing"
          :key="selectedItem.id"
          :value="selectedItemContent"
          @input="updateSelectedItemContent"
          placeholder="내용을 입력하세요..."
        />
        <OutlineDetailViewer
          v-else-if="selectedItem && !isDetailEditing"
          :content="selectedItemContent"
          @openYoutubeModal="handleOpenYoutubeModal"
        />
        <p v-else class="text-gray-500 dark:text-gray-400 text-center">항목을 선택하여 내용을 확인하세요.</p>
      </div>
    </div>

    <!-- 모바일 모달 팝업 섹션 -->
    <OutlineModal
      v-if="isMobile && showDetailModal && selectedItem"
      :isVisible="showDetailModal"
      :title="selectedItem.content"
      :content="selectedItemContent"
      :isEditing="isDetailEditing"
      @close="closeDetail"
      @update:content="updateSelectedItemContent"
      @toggle:editMode="toggleEditMode"
    />

    <!-- YouTube 크게 보기 모달 -->
    <PlayModal
      v-if="showYoutubeModal"
      :isVisible="showYoutubeModal"
      :youtubeVideoId="currentYoutubeVideoId"
      @close="handleCloseYoutubeModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick, defineAsyncComponent } from 'vue'
import { Icon } from '@iconify/vue'
import OutlineItem from '~/components/OutlineItem.vue'
import draggable from 'vuedraggable'
// 🚀 에디터 지연 로딩
const CommonQuillEditor = defineAsyncComponent(() => import('~/components/CommonQuillEditor.vue'))
import OutlineDetailViewer from '~/components/OutlineDetailViewer.vue'
import OutlineModal from '~/components/OutlineModal.vue'
import PlayModal from '~/components/youtubeGallery/PlayModal.vue'
import useYoutubeGallery from '~/composables/useYoutubeGallery.js'
import useOutlineData from '~/composables/useOutlineData.js'

// 메타 데이터
definePageMeta ({
  title: '아웃라이너 - Dion',
  meta: [
    { name: 'description', content: '아웃라이너 - Dion' },
    { name: 'keywords', content: 'Dion, 아웃라이너' }
  ]
})

// 데이터 및 함수 가져오기
const { 
  rootItems,
  zoomPath,
  selectedItem,
  selectedItemContent,
  isDetailEditing,
  showDetailModal,
  draggingItem,
  clipboardItem,
  isCutOperation,
  potentialHierarchyChange,
  isClipboardNotEmpty,
  currentItems,
  addItem,
  addAboveItem,
  addBelowItem,
  deleteItem,
  updateItem,
  indentItem,
  outdentItem,
  handleReorder,
  zoomToItem,
  zoomTo,
  zoomOut,
  handleDragStart,
  handleDragEnd,
  checkDragMove,
  handleItemSelected,
  closeDetail,
  toggleEditMode,
  toggleItem,
  handleShowDetail,
  selectItem,
  updateSelectedItemContent,
  initializeOutlineData,
  cleanupOutlineData,
  setupOutlineWatchers,
} = useOutlineData();

const { showYoutubeModal, currentYoutubeVideoId, handleOpenYoutubeModal, handleCloseYoutubeModal } = useYoutubeGallery();

// 모바일 상태 확인
const isMobile = ref(false);
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768; // Tailwind의 md breakpoint 기준
};

// --- START: New Width Feature Logic ---
const isFullWidth = ref(false); // Default to container width

onMounted(() => {
  // Load width preference from localStorage
  const storedWidthPreference = localStorage.getItem('outlinerWidthPreference');
  if (storedWidthPreference !== null) {
    isFullWidth.value = JSON.parse(storedWidthPreference);
  }
  checkMobile(); // Initial check for mobile status
  window.addEventListener('resize', checkMobile); // Listen for resize to update mobile status
  
  // Initialize outline data and setup watchers
  initializeOutlineData();
  setupOutlineWatchers();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile); // Clean up resize listener
  // Cleanup outline data persistence
  cleanupOutlineData();
});

watch(isFullWidth, (newValue) => {
  localStorage.setItem('outlinerWidthPreference', JSON.stringify(newValue));
});

const toggleWidth = () => {
  isFullWidth.value = !isFullWidth.value;
};

const mainContainerClasses = computed(() => {
  const baseClasses = "p-5 font-sans dark:bg-gray-800 md:flex md:space-x-5";
  if (!isMobile.value && isFullWidth.value) {
    return `w-full ${baseClasses}`;
  } else {
    // Default or container width on desktop, and always container width on mobile
    return `max-w-6xl mx-auto ${baseClasses}`;
  }
});
// --- END: New Width Feature Logic ---

// --- START: Layout Ratio Feature Logic ---
const currentLayoutRatio = ref('1:1'); // Default to 1:1 ratio

onMounted(() => {
  // Load ratio preference from localStorage
  const storedRatioPreference = localStorage.getItem('outlinerLayoutRatio');
  if (storedRatioPreference !== null) {
    currentLayoutRatio.value = storedRatioPreference;
  }
});

watch(currentLayoutRatio, (newValue) => {
  localStorage.setItem('outlinerLayoutRatio', newValue);
});

const toggleLayoutRatio = () => {
  switch (currentLayoutRatio.value) {
    case '1:1':
      currentLayoutRatio.value = '1:2';
      break;
    case '1:2':
      currentLayoutRatio.value = '2:1';
      break;
    case '2:1':
      currentLayoutRatio.value = '1:1';
      break;
    default:
      currentLayoutRatio.value = '1:1';
  }
};

const outlinerSectionClasses = computed(() => {
  const baseClasses = 'w-full'; // Mobile always full width or hidden
  if (isMobile.value) {
    return selectedItem.value ? 'hidden md:block' : baseClasses; // Hide outliner on mobile if detail selected, otherwise full width
  }

  // Desktop logic
  switch (currentLayoutRatio.value) {
    case '1:1':
      return `${baseClasses} md:w-1/2`;
    case '1:2':
      return `${baseClasses} md:w-1/3`;
    case '2:1':
      return `${baseClasses} md:w-2/3`;
    default:
      return `${baseClasses} md:w-1/2`;
  }
});

const detailSectionClasses = computed(() => {
  const baseClasses = 'w-full'; // Mobile always full width or hidden
  if (isMobile.value) {
    return selectedItem.value ? baseClasses : 'hidden'; // Show detail on mobile if selected, otherwise hidden
  }

  // Desktop logic
  const visibilityClass = selectedItem.value ? 'block' : 'hidden';
  switch (currentLayoutRatio.value) {
    case '1:1':
      return `${baseClasses} md:w-1/2 ${visibilityClass}`;
    case '1:2':
      return `${baseClasses} md:w-2/3 ${visibilityClass}`;
    case '2:1':
      return `${baseClasses} md:w-1/3 ${visibilityClass}`;
    default:
      return `${baseClasses} md:w-1/2 ${visibilityClass}`;
  }
});
// --- END: Layout Ratio Feature Logic ---

// --- START: Scroll Lock Feature Logic ---
const isScrollLocked = ref(false); // Default to not locked
const headerButtonsRef = ref(null); // Reference to the header buttons div
const headerHeight = ref(0); // Height of the header buttons div

onMounted(() => {
  // Load scroll lock preference from localStorage
  const storedScrollLockPreference = localStorage.getItem('outlinerScrollLock');
  if (storedScrollLockPreference !== null) {
    isScrollLocked.value = JSON.parse(storedScrollLockPreference);
  }

  // Measure header height after DOM is rendered
  nextTick(() => {
    if (headerButtonsRef.value) {
      headerHeight.value = headerButtonsRef.value.offsetHeight;
    }
  });

  // Re-measure on window resize (debounced for performance if needed, but not strictly required for this simple case)
  const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      if (entry.target === headerButtonsRef.value) {
        headerHeight.value = entry.contentRect.height;
      }
    }
  });
  if (headerButtonsRef.value) {
    resizeObserver.observe(headerButtonsRef.value);
  }

  onBeforeUnmount(() => {
    if (headerButtonsRef.value) {
      resizeObserver.unobserve(headerButtonsRef.value);
    }
  });
});

watch(isScrollLocked, (newValue) => {
  localStorage.setItem('outlinerScrollLock', JSON.stringify(newValue));
});

const toggleScrollLock = () => {
  isScrollLocked.value = !isScrollLocked.value;
};

const scrollableContentHeight = computed(() => {
  if (!isScrollLocked.value) {
    return 'auto'; // Not locked, let content flow naturally
  }
  // Calculate height considering header and padding/margin of main container
  // Example: screen height - (main container top/bottom padding + header height + other fixed elements)
  // For simplicity, let's assume `p-5` (20px top/bottom) on mainContainerClasses
  const availableHeight = window.innerHeight - headerHeight.value - (20 * 2); // 20px for p-5 top and bottom
  return `${availableHeight}px`;
});

const outlinerContainerStyle = computed(() => {
  // 아웃라이너 컨테이너는 스크롤 잠금 모드 영향을 받지 않도록 수정
  return {}; // 항상 기본 스타일 유지
});

const detailContainerStyle = computed(() => {
  if (isScrollLocked.value && !isMobile.value) {
    return { maxHeight: scrollableContentHeight.value, overflowY: 'auto' };
  }
  return {};
});
// --- END: Scroll Lock Feature Logic ---

</script>

<style scoped>
.masonry-layout {
  column-count: 1;
  column-gap: 1rem;
}

.masonry-item {
  display: inline-block;
  width: 100%;
}

@media (min-width: 640px) {
  .masonry-layout {
    column-count: 2;
  }
}

@media (min-width: 768px) {
  .masonry-layout {
    column-count: 2;
  }
}

@media (min-width: 1024px) {
  .masonry-layout {
    column-count: 3;
  }
}

@media (min-width: 1280px) {
  .masonry-layout {
    column-count: 4;
  }
}

@media (min-width: 1536px) {
  .masonry-layout {
    column-count: 5;
  }
}

@media (min-width: 1920px) {
  .masonry-layout {
    column-count: 5;
  }
}

@media (min-width: 2560px) {
  .masonry-layout {
    column-count: 6;
  }
}
</style>
