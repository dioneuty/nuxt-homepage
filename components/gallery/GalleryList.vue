<template>
  <div>
    <!-- 검색 바와 글쓰기 버튼 -->
    <div class="mb-6 flex justify-between items-center">
      <div class="relative flex-grow mr-4">
        <Icon icon="mdi:magnify" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="검색..." 
          class="w-full p-2 pl-10 border rounded-md dark:bg-gray-700 dark:text-white"
        >
      </div>
      <button 
        @click="openEditModal()" 
        class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center"
      >
        <Icon icon="mdi:plus" class="mr-2" />
        새 갤러리 항목
      </button>
    </div>

    <!-- 로딩 상태 표시 -->
    <div v-if="loading" class="text-center py-8">
      <Icon icon="mdi:loading" class="animate-spin w-8 h-8 text-blue-500" />
      <p class="mt-2 text-gray-600 dark:text-gray-400">데이터를 불러오는 중...</p>
    </div>

    <!-- 에러 메시지 표시 -->
    <div v-else-if="error" class="text-center py-8 text-red-500">
      <Icon icon="mdi:alert-circle" class="w-8 h-8 mb-2" />
      <p>데이터를 불러오는 데 실패했습니다. 다시 시도해 주세요.</p>
    </div>

    <!-- 데이터가 없을 때 메시지 표시 -->
    <div v-else-if="filteredItems.length === 0" class="text-center py-8 text-gray-600 dark:text-gray-400">
      <Icon icon="mdi:image-off" class="w-8 h-8 mb-2" />
      <p>표시할 갤러리 항목이 없습니다.</p>
    </div>

    <!-- 갤러리 masonry 레이아웃 -->
    <div v-else class="masonry-layout">
      <div v-for="item in filteredItems" :key="item.id" class="masonry-item mb-4 break-inside-avoid">
        <div @click="openModal(item)" class="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg relative cursor-pointer">
          <div class="w-full h-48 overflow-hidden">
            <ClientOnly>
              <div v-html-img-one="item.content" class="w-full h-full object-cover"></div>
            </ClientOnly>
          </div>
          <div class="p-4">
            <h2 class="text-xl font-bold mb-2 dark:text-white flex items-center">
              <Icon icon="mdi:image" class="mr-2" />
              {{ item.title }}
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-4 flex items-center">
              <Icon icon="mdi:information-outline" class="mr-2" />
              {{ item.description }}
            </p>
            <div class="flex flex-wrap gap-2 mb-8">
              <span v-for="tag in item.tags" :key="tag" class="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs flex items-center">
                <Icon icon="mdi:tag" class="mr-1" />
                {{ tag }}
              </span>
            </div>
          </div>
          <!-- 댓글 알림 박스 -->
          <div v-if="showComments" class="absolute bottom-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
            <Icon icon="mdi:comment-outline" class="mr-1" />
            {{ item.comments ? item.comments.length : 0 }}
          </div>
        </div>
      </div>
    </div>

    <GalleryModal
      v-if="selectedItem"
      :item="selectedItem"
      :apiEndpoint="apiEndpoint"
      :isFirstItem="isFirstItem"
      :isLastItem="isLastItem"
      :isAdminGallery="isAdminGallery"
      @close="closeModal"
      @edit="openEditModal"
      @delete="deleteItem"
      @update="fetchItems"
      @previous="showPreviousItem"
      @next="showNextItem"
      :showComments="showComments"
    />
    
    <GalleryEditModal
      v-if="showEditModal"
      :item="editingItem"
      :apiEndpoint="apiEndpoint"
      @close="closeEditModal"
      @save="updateItem"
    />
  </div>
</template>
  
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import GalleryModal from './GalleryModal.vue'
import GalleryEditModal from './GalleryEditModal.vue'
import { useRoute } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  apiEndpoint: {
    type: String,
    required: true
  },
  showComments: {
    type: Boolean,
    default: true
  },
  isAdminGallery: {
    type: Boolean,
    default: false,
  },
})

const items = ref([])
const searchQuery = ref('')
const selectedItem = ref(null)
const showEditModal = ref(false)
const editingItem = ref(null)
const loading = ref(true)
const error = ref(null)

const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value
  return items.value.filter(item => 
    item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const selectedItemIndex = computed(() => {
  if (!selectedItem.value) return -1
  return filteredItems.value.findIndex(item => item.id === selectedItem.value.id)
})

const isFirstItem = computed(() => selectedItemIndex.value === 0)
const isLastItem = computed(() => selectedItemIndex.value === filteredItems.value.length - 1)

async function fetchItems() {
  loading.value = true
  error.value = null
  try {
    items.value = await $fetch(props.apiEndpoint)
    return true
  } catch (err) {
    console.error('Failed to fetch gallery items:', err)
    error.value = err
    return false
  } finally {
    loading.value = false
  }
}

const route = useRoute()

async function openModalById(id) {
  if (items.value.length === 0) {
    const success = await fetchItems()
    if (!success) return
  }
  const item = items.value.find(item => item.id === parseInt(id))
  if (item) {
    openModal(item)
  }
}

watch(() => route.query.id, (newId) => {
  if (newId) {
    openModalById(newId)
  }
})

//로그인한 유저이면서 role이 admin인 유저만 보도록 하기
const auth = useAuth().auth.value

onMounted(async () => {
  //로그인한 유저이면서 role이 admin인 유저만 보도록 하기
  if (!props.isAdminGallery || (props.isAdminGallery && auth.isLoggedIn && auth.user.role === 'ADMIN')) {
    await fetchItems()

    if (route.query.id) {
      openModalById(route.query.id)
    }
  }else{
    router.push('/')
  }
})

function openModal(item) {
  selectedItem.value = item
}

function closeModal() {
  selectedItem.value = null
}

function openEditModal(item = null) {
  editingItem.value = item || { title: '', description: '', imageUrl: '', tags: [] }
  showEditModal.value = true
}

function closeEditModal() {
  editingItem.value = null
  showEditModal.value = false
}

async function updateItem(updatedItem) {
  const index = items.value.findIndex(function(item) { return item.id === updatedItem.id })
  if (index !== -1) {
    items.value[index] = updatedItem
  } else {
    items.value.unshift(updatedItem)
  }
  if (selectedItem.value && selectedItem.value.id === updatedItem.id) {
    selectedItem.value = updatedItem
  }
  closeEditModal()
}

function deleteItem(deletedItemId) {
  items.value = items.value.filter(function(item) { return item.id !== deletedItemId })
  selectedItem.value = null
}

function showPreviousItem() {
  if (!isFirstItem.value) {
    selectedItem.value = filteredItems.value[selectedItemIndex.value - 1]
  }
}

function showNextItem() {
  if (!isLastItem.value) {
    selectedItem.value = filteredItems.value[selectedItemIndex.value + 1]
  }
}

defineExpose({ fetchItems })
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
    column-count: 4;
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