import { defineStore } from 'pinia'

export const useGalleryStore = defineStore('gallery', {
  state: () => ({
    selectedItem: null,
  }),
  actions: {
    setSelectedItem(item) {
      this.selectedItem = item
    },
    clearSelectedItem() {
      this.selectedItem = null
    },
  },
})