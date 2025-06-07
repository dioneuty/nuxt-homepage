import { defineStore } from 'pinia';

export const useMenuStore = defineStore('menu', {
  state: () => ({
    menus: [],
    loading: false,
    error: null,
  }),
  getters: {
    // 특정 권한을 가진 사용자에게 허용된 메뉴만 필터링
    getAccessibleMenus: (state) => (userRole = 'public') => {
      const filterMenus = (menus) => {
        return menus.filter(menu => {
          const hasAccess = !menu.role || menu.role === 'public' || menu.role === userRole || (userRole === 'admin');
          if (hasAccess && menu.children) {
            menu.children = filterMenus(menu.children);
          }
          return hasAccess;
        }).sort((a, b) => a.order - b.order);
      };
      // state.menus를 깊은 복사하여 원본을 변경하지 않도록 함
      return filterMenus(JSON.parse(JSON.stringify(state.menus)));
    }
  },
  actions: {
    async fetchMenus() {
      this.loading = true;
      this.error = null;
      try {
        const data = await $fetch('/api/menus');
        this.menus = data;
      } catch (e) {
        this.error = e;
      } finally {
        this.loading = false;
      }
    },
  },
}); 