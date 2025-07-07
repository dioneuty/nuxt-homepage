import { defineStore } from 'pinia';

/**
 * 메뉴 관리 스토어
 * - 사이트 네비게이션 메뉴 데이터를 관리
 * - 사용자 권한에 따른 메뉴 필터링 기능 제공
 * - 메뉴 데이터 로딩 상태 관리
 */
export const useMenuStore = defineStore('menu', {
  state: () => ({
    menus: [], // 전체 메뉴 데이터 배열
    loading: false, // 메뉴 로딩 상태
    error: null, // 에러 상태 저장
  }),
  
  getters: {
    /**
     * 사용자 권한에 따라 접근 가능한 메뉴만 필터링하여 반환
     * @param {string} userRole - 사용자 권한 ('public', 'user', 'admin')
     * @returns {Array} 필터링된 메뉴 배열 (order 순으로 정렬)
     */
    getAccessibleMenus: (state) => (userRole = 'public') => {
      const filterMenus = (menus) => {
        return menus.filter(menu => {
          // 메뉴 접근 권한 확인
          // - role이 없거나 'public'인 경우: 모든 사용자 접근 가능
          // - userRole이 'admin'인 경우: 모든 메뉴 접근 가능
          // - 그 외의 경우: 메뉴의 role과 사용자 role이 일치해야 함
          const hasAccess = !menu.role || menu.role === 'public' || menu.role === userRole || (userRole === 'admin');
          
          // 접근 권한이 있고 하위 메뉴가 있는 경우 재귀적으로 필터링
          if (hasAccess && menu.children) {
            menu.children = filterMenus(menu.children);
          }
          return hasAccess;
        }).sort((a, b) => a.order - b.order); // order 필드로 정렬
      };
      
      // state.menus를 깊은 복사하여 원본을 변경하지 않도록 함
      return filterMenus(JSON.parse(JSON.stringify(state.menus)));
    }
  },
  
  actions: {
    /**
     * 서버에서 메뉴 데이터를 가져와 상태를 업데이트
     * @async
     * @throws {Error} API 호출 실패 시 에러 상태 설정
     */
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