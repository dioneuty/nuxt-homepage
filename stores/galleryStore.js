import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useGalleryStore = defineStore('gallery', () => {
  const selectedItem = ref(null)

  function setSelectedItem(item) {
    selectedItem.value = item
  }

  function clearSelectedItem() {
    selectedItem.value = null
  }

  return {
    selectedItem,
    setSelectedItem,
    clearSelectedItem
  }
})