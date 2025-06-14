import { defineStore } from 'pinia';

export const useLayoutStore = defineStore('layout', {
  state: () => ({
    isSidebarOpen: false,
  }),
  actions: {
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
      if (process.client) {
        localStorage.setItem('layoutPreference', this.isSidebarOpen.toString());
      }
    },
    initializeSidebarState() {
      if (process.client) {
        const storedPreference = localStorage.getItem('layoutPreference');
        if (storedPreference !== null) {
          this.isSidebarOpen = storedPreference === 'true';
        } else {
          // 기본값: 가로형 헤더바가 메인 (사이드바 닫힘)
          this.isSidebarOpen = false; 
        }
      }
    },
  },
}); 