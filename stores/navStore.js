import { defineStore } from 'pinia'

export const useNavStore = defineStore('nav', () => {
  const isAlwaysOnTop = ref(false)

  function setIsAlwaysOnTop(value) {
    isAlwaysOnTop.value = value
  }

  function toggleIsAlwaysOnTop() {
    isAlwaysOnTop.value = !isAlwaysOnTop.value
  }

  return {
    isAlwaysOnTop,
    setIsAlwaysOnTop,
    toggleIsAlwaysOnTop
  }
}, {
  persist: true
})