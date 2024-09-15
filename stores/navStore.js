import { defineStore } from 'pinia'

export const useNavStore = defineStore('nav', {
  state: () => ({
    isAlwaysOnTop: false
  }),
  actions: {
    setAlwaysOnTop(value) {
      this.isAlwaysOnTop = value
    }
  }
})