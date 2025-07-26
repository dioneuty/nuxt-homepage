# Command Palette System Documentation

## 📋 개요

Command Palette는 키보드 단축키 기반의 빠른 명령 실행 및 검색 인터페이스를 제공하는 핵심 UX 컴포넌트입니다. Cmd+K/Ctrl+K 단축키로 활성화되며, 글래스모피즘 디자인과 함께 직관적인 사용자 경험을 제공합니다.

## 🏗️ 아키텍처

### 컴포넌트 구조
```
CommandPalette.vue (UI Layer)
├── useCommandPalette.js (Logic Layer)
├── MenuStore (Data Layer)
└── Search API (Backend Integration)
```

### 핵심 구성 요소

#### 1. **UI 컴포넌트** (`components/common/CommandPalette.vue`)
- **글래스모피즘 디자인**: 반투명 배경 + 백드롭 블러 효과
- **반응형 인터페이스**: 모바일/데스크톱 최적화
- **키보드 네비게이션**: ↑↓ 탐색, Enter 선택, ESC 닫기
- **실시간 검색**: 300ms 디바운싱 적용

#### 2. **비즈니스 로직** (`composables/useCommandPalette.js`)
- **상태 관리**: 검색어, 결과, 선택 인덱스, 로딩 상태
- **검색 엔진**: 기본 명령어 + 메뉴 명령어 + API 검색 통합
- **권한 기반 필터링**: 사용자 권한에 따른 메뉴 접근 제어
- **키보드 이벤트 핸들링**: 전역 키보드 이벤트 관리

## 🔧 주요 기능

### 1. **기본 명령어 (7개)**
```javascript
const defaultCommands = [
  { id: 'home', title: '홈페이지로 이동', icon: '🏠' },
  { id: 'new-blog', title: '새 블로그 포스트 작성', icon: '✏️' },
  { id: 'new-board', title: '새 게시물 작성', icon: '📝' },
  { id: 'new-wiki', title: '새 위키 페이지 작성', icon: '📖' },
  { id: 'gallery', title: '갤러리 보기', icon: '🖼️' },
  { id: 'search', title: '통합 검색', icon: '🔍' },
  { id: 'outliner', title: '아웃라이너', icon: '📋' }
]
```

### 2. **동적 메뉴 명령어**
- **메뉴 스토어 연동**: 실시간 메뉴 데이터 로드
- **권한 기반 필터링**: public/user/admin 역할별 접근 제어
- **계층형 구조 지원**: 부모 > 자식 메뉴 경로 표시
- **아이콘 매핑**: 메뉴별 고유 아이콘 표시

### 3. **통합 검색**
- **API 연동**: 기존 `/api/search` 엔드포인트 활용
- **멀티 소스 검색**: 게시판, 블로그, 위키, 갤러리 통합
- **결과 통합**: 명령어 + 검색 결과 하나의 인터페이스
- **타입별 아이콘**: 콘텐츠 타입에 따른 시각적 구분

## 🎨 UI/UX 설계

### 글래스모피즘 디자인
```css
.command-palette-container {
  background: rgba(17, 24, 39, 0.4); /* bg-gray-900/40 */
  backdrop-filter: blur(12px); /* backdrop-blur-xl */
  border: 1px solid rgba(55, 65, 81, 0.5); /* border-gray-700/50 */
  border-radius: 1rem; /* rounded-2xl */
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); /* shadow-2xl */
}
```

### 키보드 네비게이션
- **활성화**: `Cmd+K` (Mac) / `Ctrl+K` (Windows/Linux)
- **탐색**: `↑↓` 화살표 키
- **선택**: `Enter` 키
- **닫기**: `ESC` 키
- **검색**: 타이핑으로 즉시 검색 시작

### 상태 표시
- **로딩 스피너**: 검색 중 애니메이션 표시
- **선택 하이라이트**: 파란색 배경 + 우측 보더
- **키보드 힌트**: 하단 단축키 가이드
- **결과 카운터**: 검색 결과 개수 표시

## ⚙️ 기술적 구현

### 상태 관리
```javascript
const state = {
  isCommandPaletteOpen: ref(false),    // 팔레트 열림/닫힘
  searchQuery: ref(''),               // 현재 검색어
  searchResults: ref([]),             // 검색 결과 배열
  selectedIndex: ref(0),              // 선택된 항목 인덱스
  isLoading: ref(false)               // 로딩 상태
}
```

### 검색 알고리즘
```javascript
async function performSearch(query) {
  if (!query.trim()) {
    // 빈 검색어: 기본 명령어 + 메뉴 명령어 표시
    searchResults.value = [...getDefaultCommands(), ...getMenuCommands()]
    return
  }

  // 1. 로컬 명령어 필터링
  const localResults = filterLocalCommands(query)
  
  // 2. API 검색 실행
  const apiResults = await searchAPI(query)
  
  // 3. 결과 통합 및 표시
  searchResults.value = [...localResults, ...apiResults]
}
```

### 디바운싱 구현
```javascript
let searchTimeout = null

function handleSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)
  
  searchTimeout = setTimeout(() => {
    performSearch(searchQuery.value)
  }, 300) // 300ms 디바운싱
}
```

## 🔐 보안 및 권한

### 권한 기반 필터링
```javascript
function getMenuCommands() {
  const userRole = computed(() => {
    if (isAdmin?.value) return 'admin'
    if (user?.value) return 'user'
    return 'public'
  })

  const accessibleMenus = menuStore.getAccessibleMenus(userRole.value)
  return processMenusToCommands(accessibleMenus)
}
```

### XSS 방지
- **HTML 이스케이핑**: 모든 사용자 입력 자동 이스케이프
- **안전한 네비게이션**: `navigateTo()` 함수를 통한 라우팅
- **입력 검증**: 검색어 길이 및 형식 제한

## 📊 성능 최적화

### 지연 로딩
- **메뉴 데이터**: 필요시에만 로드
- **검색 API**: 디바운싱으로 요청 최소화
- **DOM 업데이트**: Vue의 반응성 시스템 활용

### 메모리 관리
```javascript
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown) // 메모리 누수 방지
})
```

### 캐싱 전략
- **메뉴 데이터**: 스토어 레벨 캐싱
- **검색 결과**: 세션 기간 동안 유지
- **아이콘 매핑**: 정적 객체로 사전 정의

## 🧪 테스트 시나리오

### 기능 테스트
1. **단축키 활성화**: Cmd+K/Ctrl+K로 팔레트 열기
2. **기본 명령어**: 빈 검색어에서 7개 기본 명령어 표시
3. **메뉴 명령어**: 사용자 권한에 따른 메뉴 필터링
4. **통합 검색**: 키워드로 콘텐츠 검색 및 결과 표시
5. **키보드 네비게이션**: 화살표 키로 선택 이동
6. **명령 실행**: Enter 키로 명령 실행 및 팔레트 닫기

### 성능 테스트
- **검색 응답 시간**: < 500ms
- **UI 반응성**: < 100ms
- **메모리 사용량**: < 5MB 추가 사용량
- **키보드 지연**: < 50ms

### 접근성 테스트
- **키보드 전용 네비게이션**: 마우스 없이 완전 조작 가능
- **스크린 리더**: 적절한 ARIA 라벨링
- **고대비 모드**: 다크/라이트 테마 지원
- **폰트 크기**: 사용자 설정에 따른 반응형 크기

## 🔄 향후 개선 계획

### Short-term (1-2개월)
1. **최근 검색어**: 자주 사용하는 명령어 우선 표시
2. **즐겨찾기**: 사용자 정의 명령어 추가
3. **검색 하이라이팅**: 검색어 강조 표시
4. **키보드 커스터마이징**: 단축키 변경 기능

### Long-term (3-6개월)
1. **AI 추천**: 사용 패턴 기반 명령어 추천
2. **플러그인 시스템**: 서드파티 명령어 확장
3. **글로벌 검색**: 외부 서비스 통합 검색
4. **음성 명령**: 음성 인식 기반 명령 실행

## 📖 사용 가이드

### 기본 사용법
1. `Cmd+K` (Mac) 또는 `Ctrl+K` (Windows/Linux) 눌러 팔레트 열기
2. 명령어명 또는 검색어 입력
3. `↑↓` 키로 원하는 항목 선택
4. `Enter` 키로 실행 또는 `ESC` 키로 닫기

### 고급 팁
- **빠른 네비게이션**: "홈", "새", "검색" 등 간단한 키워드 활용
- **메뉴 탐색**: 메뉴명을 입력하여 빠른 페이지 이동
- **콘텐츠 검색**: 제목이나 내용으로 기존 게시물 빠른 찾기

## 🐛 알려진 이슈

1. **메뉴 로딩 의존성**: 메뉴 스토어 로딩 완료 후 초기화 필요
2. **모바일 키보드**: 일부 모바일 브라우저에서 단축키 제한
3. **검색 성능**: 대용량 콘텐츠에서 검색 지연 가능성

---

*이 문서는 Command Palette 시스템의 완전한 기술 문서입니다. 추가 질문이나 개선 사항은 개발팀에 문의하세요.*