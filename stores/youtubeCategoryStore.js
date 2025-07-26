// stores/youtubeCategoryStore.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useYoutubeCategoryStore = defineStore('youtubeCategory', () => {
  // State
  const categories = ref([])
  const activeCategory = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const sortedCategories = computed(() => {
    console.log('youtubeCategoryStore: sortedCategories 계산 시작. categories.value:', categories.value);
    const result = [...categories.value].sort((a, b) => {
      if (a.id === 'all') return -1
      if (b.id === 'all') return 1
      return (a.order || 0) - (b.order || 0)
    })
    console.log('youtubeCategoryStore: sortedCategories 계산 완료. 결과:', result);
    return result;
  })

  const activeCategoryData = computed(() => {
    if (!activeCategory.value) return null
    return categories.value.find(c => c.id === activeCategory.value) || null
  })

  const totalVideoCount = computed(() => {
    console.log('youtubeCategoryStore: totalVideoCount 계산 시작. categories.value:', categories.value);
    const allCategory = categories.value.find(c => c.id === 'all')
    const count = allCategory ? allCategory.video_count : 0
    console.log('youtubeCategoryStore: totalVideoCount 계산 완료. 결과:', count);
    return count;
  })

  // Actions
  async function fetchCategories(useAdminEndpoint = false) {
    loading.value = true
    error.value = null
    
    try {
      const endpoint = useAdminEndpoint ? '/api/admin/youtube-categories' : '/api/youtube-categories'
      const response = await $fetch(endpoint)
      categories.value = response
      console.log('youtubeCategoryStore: fetchCategories API 응답 후 categories.value:', categories.value);
      console.log('youtubeCategoryStore: fetchCategories API 응답 후 sortedCategories:', sortedCategories.value);
      console.log('youtubeCategoryStore: fetchCategories API 응답 후 totalVideoCount:', totalVideoCount.value);
      
      // 활성 카테고리가 없거나 삭제된 경우 '전체'로 설정
      if (!activeCategory.value || !categories.value.find(c => c.id === activeCategory.value)) {
        setActiveCategory('all')
      }
      
      return response
    } catch (err) {
      console.error('YouTube 카테고리 조회 실패:', err)
      error.value = err.message || '카테고리를 불러오는 데 실패했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createCategory(categoryData) {
    loading.value = true
    error.value = null
    
    try {
      // 카테고리 생성은 관리자 API를 통해 전체 목록을 업데이트하는 방식으로 처리
      // 기존 카테고리에 새 카테고리 추가
      const existingCategories = categories.value.filter(c => c.id !== 'all')
      const newCategories = [...existingCategories, { ...categoryData, video_count: 0 }]
      
      await updateCategories(newCategories, [])
      
      return categoryData
    } catch (err) {
      console.error('YouTube 카테고리 생성 실패:', err)
      error.value = err.message || '카테고리 생성에 실패했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateCategories(categoriesData, deletedCategoryIds = []) {
    loading.value = true
    error.value = null
    
    try {
      await $fetch('/api/admin/youtube-categories', {
        method: 'PUT',
        body: {
          categories: categoriesData,
          deletedCategories: deletedCategoryIds
        }
      })
      
      // 카테고리 목록 새로고침
      await fetchCategories(true)
      
      return true
    } catch (err) {
      console.error('YouTube 카테고리 업데이트 실패:', err)
      error.value = err.message || '카테고리 업데이트에 실패했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteCategory(categoryId) {
    loading.value = true
    error.value = null
    
    try {
      // 카테고리 삭제는 관리자 API를 통해 전체 목록을 업데이트하는 방식으로 처리
      const existingCategories = categories.value.filter(c => c.id !== 'all' && c.id !== categoryId)
      const deletedCategoryIds = [categoryId]
      
      await updateCategories(existingCategories, deletedCategoryIds)
      
      // 삭제된 카테고리가 활성 카테고리였다면 '전체'로 변경
      if (activeCategory.value === categoryId) {
        setActiveCategory('all')
      }
      
      return true
    } catch (err) {
      console.error('YouTube 카테고리 삭제 실패:', err)
      error.value = err.message || '카테고리 삭제에 실패했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  function setActiveCategory(categoryId) {
    const category = categories.value.find(c => c.id === categoryId)
    if (category || categoryId === 'all') {
      activeCategory.value = categoryId
    }
  }

  function updateCategoryVideoCount(categoryId, increment = true) {
    const category = categories.value.find(c => c.id === categoryId)
    if (category) {
      category.video_count += increment ? 1 : -1
    }
    
    // '전체' 카테고리의 비디오 수도 업데이트
    const allCategory = categories.value.find(c => c.id === 'all')
    if (allCategory) {
      allCategory.video_count += increment ? 1 : -1
    }
  }

  function getCategoryById(id) {
    return categories.value.find(c => c.id === id) || null
  }

  function getCategoryBySlug(slug) {
    return categories.value.find(c => c.slug === slug) || null
  }

  // 카테고리별 비디오 수 다시 계산
  function recalculateVideoCounts(videos = []) {
    // 각 카테고리의 비디오 수 초기화
    categories.value.forEach(category => {
      if (category.id !== 'all') {
        category.video_count = 0
      }
    })
    
    // 비디오 배열을 순회하며 카테고리별 수 계산
    videos.forEach(video => {
      if (video.categoryId) {
        const category = categories.value.find(c => c.id === video.categoryId)
        if (category) {
          category.video_count += 1
        }
      }
    })
    
    // '전체' 카테고리 수 업데이트
    const allCategory = categories.value.find(c => c.id === 'all')
    if (allCategory) {
      allCategory.video_count = videos.length
    }
  }

  function clearError() {
    error.value = null
  }

  function resetStore() {
    categories.value = []
    activeCategory.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    categories,
    activeCategory,
    loading,
    error,
    
    // Getters
    sortedCategories,
    activeCategoryData,
    totalVideoCount,
    
    // Actions
    fetchCategories,
    createCategory,
    updateCategories,
    deleteCategory,
    setActiveCategory,
    updateCategoryVideoCount,
    getCategoryById,
    getCategoryBySlug,
    recalculateVideoCounts,
    clearError,
    resetStore
  }
})

// Composable function for easier usage
export function useYoutubeCategories() {
  const store = useYoutubeCategoryStore()
  
  return {
    // State
    categories: store.categories,
    activeCategory: store.activeCategory,
    loading: store.loading,
    error: store.error,
    
    // Getters
    sortedCategories: store.sortedCategories,
    activeCategoryData: store.activeCategoryData,
    totalVideoCount: store.totalVideoCount,
    
    // Actions
    fetchCategories: store.fetchCategories,
    createCategory: store.createCategory,
    updateCategories: store.updateCategories,
    deleteCategory: store.deleteCategory,
    setActiveCategory: store.setActiveCategory,
    updateCategoryVideoCount: store.updateCategoryVideoCount,
    getCategoryById: store.getCategoryById,
    getCategoryBySlug: store.getCategoryBySlug,
    recalculateVideoCounts: store.recalculateVideoCounts,
    clearError: store.clearError,
    resetStore: store.resetStore
  }
}