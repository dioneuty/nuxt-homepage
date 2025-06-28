import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMenuStore } from '~/stores/menu'
import { useAuth } from '~/composables/useAuth'

const isCommandPaletteOpen = ref(false) // Command Palette 열림/닫힘 상태
const searchQuery = ref('') // 현재 검색어
const searchResults = ref([]) // 검색 결과 배열
const selectedIndex = ref(0) // 현재 선택된 항목 인덱스
const isLoading = ref(false) // 검색 로딩 상태

/**
 * Command Palette의 상태와 동작을 관리하는 컴포저블 함수입니다.
 * 키보드 단축키, 검색, 네비게이션 기능을 제공합니다.
 * @returns {Object} Command Palette 관련 속성 및 함수
 */
export function useCommandPalette() {
  const menuStore = useMenuStore()
  const { user, isAdmin } = useAuth()
  /**
   * Command Palette를 엽니다.
   */
  function openCommandPalette() {
    isCommandPaletteOpen.value = true
    searchQuery.value = ''
    searchResults.value = []
    selectedIndex.value = 0
    // 다음 틱에서 입력창에 포커스 설정
    setTimeout(() => {
      const input = document.querySelector('.command-palette-input')
      if (input) input.focus()
    }, 100)
  }

  /**
   * Command Palette를 닫고 상태를 초기화합니다.
   */
  function closeCommandPalette() {
    isCommandPaletteOpen.value = false
    resetCommandPalette()
  }

  /**
   * Command Palette의 모든 상태를 초기화합니다.
   */
  function resetCommandPalette() {
    searchQuery.value = ''
    searchResults.value = []
    selectedIndex.value = 0
    isLoading.value = false
  }

  /**
   * 검색을 수행합니다.
   * @param {string} query - 검색어
   */
  async function performSearch(query) {
    if (!query.trim()) {
      searchResults.value = [...getDefaultCommands(), ...getMenuCommands()]
      return
    }

    isLoading.value = true
    try {
      // 기존 /api/search API 활용
      const data = await $fetch('/api/search', {
        method: 'POST',
        body: { query }
      })

      // 기본 명령어 필터링
      const defaultCommands = getDefaultCommands().filter(cmd => 
        cmd.title.toLowerCase().includes(query.toLowerCase()) ||
        cmd.description?.toLowerCase().includes(query.toLowerCase())
      )

      // 메뉴 명령어 필터링
      const menuCommands = getMenuCommands().filter(cmd => 
        cmd.title.toLowerCase().includes(query.toLowerCase()) ||
        cmd.description?.toLowerCase().includes(query.toLowerCase())
      )

      searchResults.value = [
        ...defaultCommands,
        ...menuCommands,
        ...(data || []).map(result => ({
          id: `search-${result.id}`,
          title: result.title,
          description: result.excerpt,
          type: result.type,
          link: result.link,
          icon: getIconForType(result.type),
          action: () => navigateTo(result.link)
        }))
      ]
    } catch (error) {
      console.error('검색 중 오류 발생:', error)
      searchResults.value = [...getDefaultCommands(), ...getMenuCommands()]
    } finally {
      isLoading.value = false
      selectedIndex.value = 0
    }
  }

  /**
   * 메뉴에서 명령어 목록을 생성합니다.
   * @returns {Array} 메뉴 기반 명령어 배열
   */
  function getMenuCommands() {
    const userRole = computed(() => {
      if (isAdmin && isAdmin.value) return 'admin'
      if (user && user.value) return 'user'
      return 'public'
    })

    const accessibleMenus = menuStore.getAccessibleMenus(userRole.value)
    const commands = []

    /**
     * 메뉴 항목을 재귀적으로 처리하여 명령어로 변환합니다.
     * @param {Array} menus - 메뉴 배열
     * @param {string} parentName - 부모 메뉴 이름 (경로 표시용)
     */
    function processMenus(menus, parentName = '') {
      menus.forEach(menu => {
        // 경로가 있는 메뉴만 명령어로 추가
        if (menu.path && menu.path !== '#') {
          const fullName = parentName ? `${parentName} > ${menu.name}` : menu.name
          commands.push({
            id: `menu-${menu.id}`,
            title: menu.name,
            description: parentName ? `${parentName}의 ${menu.name} 페이지로 이동` : `${menu.name} 페이지로 이동`,
            icon: menu.icon || 'mdi:menu',
            type: '메뉴',
            action: () => navigateTo(menu.path)
          })
        }
        
        // 하위 메뉴가 있으면 재귀 처리
        if (menu.children && menu.children.length > 0) {
          processMenus(menu.children, menu.name)
        }
      })
    }

    processMenus(accessibleMenus)
    return commands
  }

  /**
   * 기본 명령어 목록을 반환합니다.
   * @returns {Array} 기본 명령어 배열
   */
  function getDefaultCommands() {
    return [
      {
        id: 'home',
        title: '홈페이지로 이동',
        description: '메인 페이지로 돌아갑니다',
        icon: 'mdi:home',
        action: () => navigateTo('/')
      },
      {
        id: 'new-blog',
        title: '새 블로그 포스트 작성',
        description: '새로운 블로그 글을 작성합니다',
        icon: 'mdi:pencil-plus',
        action: () => navigateTo('/blog/write')
      },
      {
        id: 'new-board',
        title: '새 게시물 작성',
        description: '새로운 게시판 글을 작성합니다',
        icon: 'mdi:clipboard-text-plus',
        action: () => navigateTo('/board/write')
      },
      {
        id: 'new-wiki',
        title: '새 위키 페이지 작성',
        description: '새로운 위키 페이지를 작성합니다',
        icon: 'mdi:book-plus',
        action: () => navigateTo('/wiki/edit')
      },
      {
        id: 'gallery',
        title: '갤러리 보기',
        description: '이미지 갤러리를 확인합니다',
        icon: 'mdi:image-multiple',
        action: () => navigateTo('/gallery')
      },
      {
        id: 'search',
        title: '통합 검색',
        description: '전체 사이트에서 검색합니다',
        icon: 'mdi:magnify',
        action: () => navigateTo('/search')
      },
      {
        id: 'outliner',
        title: '아웃라이너',
        description: '아웃라이너 도구를 사용합니다',
        icon: 'mdi:format-list-bulleted-type',
        action: () => navigateTo('/outliner')
      }
    ]
  }

  /**
   * 컨텐츠 타입에 따른 아이콘을 반환합니다.
   * @param {string} type - 컨텐츠 타입
   * @returns {string} 아이콘 이름
   */
  function getIconForType(type) {
    switch (type) {
      case '게시판': return 'mdi:clipboard-text-outline'
      case '블로그': return 'mdi:post-outline'
      case '위키': return 'mdi:book-open-page-variant'
      case '갤러리': return 'mdi:image-multiple'
      case '질문과 답변': return 'mdi:help-circle-outline'
      case '유머게시판': return 'mdi:emoticon-happy-outline'
      default: return 'mdi:file-document-outline'
    }
  }

  /**
   * 선택된 항목을 위로 이동합니다.
   */
  function moveSelectionUp() {
    if (selectedIndex.value > 0) {
      selectedIndex.value--
    }
  }

  /**
   * 선택된 항목을 아래로 이동합니다.
   */
  function moveSelectionDown() {
    if (selectedIndex.value < searchResults.value.length - 1) {
      selectedIndex.value++
    }
  }

  /**
   * 현재 선택된 항목을 실행합니다.
   */
  function executeSelectedCommand() {
    const selectedCommand = searchResults.value[selectedIndex.value]
    if (selectedCommand && selectedCommand.action) {
      selectedCommand.action()
      closeCommandPalette()
    }
  }

  /**
   * 키보드 이벤트를 처리합니다.
   * @param {KeyboardEvent} event - 키보드 이벤트
   */
  function handleKeyDown(event) {
    // Command Palette가 열려있지 않으면 Cmd+K/Ctrl+K만 처리
    if (!isCommandPaletteOpen.value) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        openCommandPalette()
      }
      return
    }

    // Command Palette가 열려있을 때의 키보드 네비게이션
    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        closeCommandPalette()
        break
      case 'ArrowUp':
        event.preventDefault()
        moveSelectionUp()
        break
      case 'ArrowDown':
        event.preventDefault()
        moveSelectionDown()
        break
      case 'Enter':
        event.preventDefault()
        executeSelectedCommand()
        break
    }
  }

  // 컴포넌트 마운트 시 키보드 이벤트 리스너 등록
  onMounted(async () => {
    // 메뉴 데이터 로드
    if (menuStore.menus.length === 0) {
      await menuStore.fetchMenus()
    }
    
    // 초기 검색 결과를 기본 명령어와 메뉴 명령어로 설정
    searchResults.value = [...getDefaultCommands(), ...getMenuCommands()]
    
    // 전역 키보드 이벤트 리스너 등록
    document.addEventListener('keydown', handleKeyDown)
  })

  // 컴포넌트 언마운트 시 이벤트 리스너 제거
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })

  return {
    // 1. Command Palette 관련 상태
    isCommandPaletteOpen, // Command Palette 열림/닫힘 상태
    searchQuery, // 현재 검색어
    searchResults, // 검색 결과 배열
    selectedIndex, // 현재 선택된 항목 인덱스
    isLoading, // 검색 로딩 상태

    // 2. Command Palette 관련 함수
    openCommandPalette, // Command Palette를 여는 함수
    closeCommandPalette, // Command Palette를 닫는 함수
    performSearch, // 검색을 수행하는 함수
    moveSelectionUp, // 선택을 위로 이동하는 함수
    moveSelectionDown, // 선택을 아래로 이동하는 함수
    executeSelectedCommand, // 선택된 명령을 실행하는 함수
  }
} 