---
description: 
globs: 
alwaysApply: true
---
# 진행 상황

## 완료된 작업
- **관리자 기능 - DB 관리**: Prisma 스키마의 모든 모델에 대해 동적 CRUD API 및 웹 UI 구현 완료.
- **관리자 기능 - 사용자 관리**: 사용자 정보 CRUD, 비밀번호 재설정, 계정 활성화/비활성화 기능 구현 완료.
- **관리자 기능 - 동적 메뉴 관리**: DB 기반의 동적 메뉴 시스템 구현 완료.
- **핵심 기능**:
  - **인증 시스템**:
    - 회원가입, 로그인/로그아웃, 역할 기반 접근 제어(RBAC) 기능 안정화.
    - `components/common/RegisterModal.vue`의 회원가입 폼을 활성화하고, 회원가입 성공 시 토스트 알림을 표시하도록 했습니다.
    - `server/api/user.js`의 `handleRegister` 함수에 사용자 이름과 이메일 중복 확인 로직을 추가하여 고유성을 보장합니다.
    - `server/api/user/check-username.get.js` API를 생성하여 실시간 사용자 이름 중복 확인 기능을 제공합니다.
    - `components/common/RegisterModal.vue`에서 사용자 이름, 이메일, 비밀번호 필드에 실시간 유효성 검사 및 결과(빨간색/녹색)를 표시합니다.
    - 회원가입 모달 닫기 시 모든 입력 필드 및 유효성 검사 상태를 초기화하도록 `components/common/RegisterModal.vue`에 로직을 추가했습니다.
    - "회원가입" 버튼이 사용자 이름 중복 확인 및 모든 필드의 유효성 검사를 통과해야만 활성화되도록 로직을 강화했습니다.
  - **게시판**: 게시글/답글 CRUD 기능 구현 완료.
  - **에디터 (Quill)**:
    - `QuillEditor` 기반의 공용 텍스트 에디터 컴포넌트 구현.
    - **다중 이미지 업로드**: 여러 이미지를 동시에 선택하여 본문에 삽입하는 기능 구현 완료.
    - **Base64 이미지 임베딩**: 이미지를 서버에 업로드하는 대신 Base64로 변환하여 콘텐츠에 직접 포함시키는 방식으로 변경. 이를 통해 별도 이미지 관리 로직 없이 콘텐츠와 이미지를 함께 관리 가능.
    - **이미지 편집 기능**: `quill-resize-module`을 활용하여 에디터 내에서 이미지 리사이즈, 삭제, 교체 기능 구현 완료. SSR 환경과의 호환성 문제 해결.
- **기반 시스템**:
  - **프로젝트 설정**: Nuxt.js, Prisma, Tailwind CSS 등 초기 설정 완료.
  - **UI/UX**:
    - 반응형 레이아웃, 아이콘 시스템, 모달 등 공용 UI 시스템 구축.
    - `pages/personal-info.vue`에서 "이름" 입력 필드를 `disabled` 처리하여 수정 불가능하도록 하고, 시각적으로(어두운 배경색 및 `cursor-not-allowed`) 비활성화 상태를 명확히 했습니다.
  - **다크 모드 구현**: `@nuxtjs/color-mode` 모듈과 Tailwind CSS `darkMode: 'class'`를 활용하여 관리자 페이지 포함 전반적인 애플리케이션의 다크/라이트/시스템 모드 연동 및 UI 스타일 적용 완료. 관리자 페이지 헤더에 모드 전환 아이콘 추가.
  - **아웃라이너 페이지 오류 수정**: `vuedraggable`의 `Item slot must have only one child` 오류 해결을 위해 `pages/outliner.vue` 및 `components/OutlineItem.vue`에서 드래그 가능한 항목 슬롯 내부에 단일 최상위 요소(`div`)를 명시적으로 감싸는 구조로 수정 완료.
  - **아웃라이너 페이지 기능 개선**: `TypeError: Cannot read properties of null (reading 'id')` 오류 해결을 위해 `pages/outliner.vue`의 `handleDragStart` 함수에서 `id`를 `parseInt`로 변환하던 로직을 제거했습니다. 최상위 노드 드래그앤드롭 재정렬 문제를 해결하기 위해 `pages/outliner.vue`와 `components/OutlineItem.vue`의 `draggable` 컴포넌트 `group` 속성을 `{ name: 'outline-group', pull: true, put: true }`로 명시적 객체 형태로 변경했습니다. `pages/outliner.vue`의 최상위 `draggable` 컴포넌트 내 `template #item` 슬롯에서 `OutlineItem`을 감싸던 불필요한 `<div>` 태그를 제거했으며, 진단 목적으로 `pages/outliner.vue`의 최상위 `draggable` 컴포넌트에서 `handle=".drag-handle"` 속성을 임시 제거하고 `checkDragMove` 함수 내부의 유효성 검사 로직을 임시 주석 처리했습니다.
  - **브레드크럼 표시 오류 해결**: 중첩된 아이템의 브레드크럼 경로가 올바르게 표시되지 않던 문제를 해결하기 위해 `pages/outliner.vue`에 `findPathToItem` 함수를 추가하고 `zoomToItem` 함수를 수정하여 선택된 아이템의 전체 경로를 정확하게 반영하도록 했습니다.
  - **Nuxt/Vue 경고 메시지 해결**: `useFetch` 경고 (`BlogIndex.vue`), `showMobileCategory` 경고 (`blog.vue`), Vue Router `to="#"` 경고 (`AppMenu.vue`) 등 다양한 경고 메시지를 해결 완료. 또한 `OutlineItem.vue`의 `@copy`, `@paste`, `@change` 이벤트 바인딩 오류(직접 `emit` 함수를 호출하도록 수정)를 해결하여 시스템 안정성을 높였습니다.
  - **관리자 페이지 UI 개선**: `/adminpage/posts`에 게시판 관리 페이지 UI(목록 테이블, '새 게시판 추가' 버튼, 추가/수정 모달) 구현 및 더미 데이터 기반 CRUD 기능(추가, 수정, 삭제) 포함 완료.
  - **관리자 페이지 다크 모드 스타일 적용**: `pages/adminpage/index.vue`, `pages/adminpage/database.vue`, `pages/adminpage/menus.vue`, `pages/adminpage/posts.vue` 등 주요 관리자 페이지에 다크 모드에 맞는 텍스트 및 UI 요소 색상 스타일 적용 완료.
  - **관리자 페이지 사이드바 메뉴 정렬 수정**: `layouts/admin.vue` 파일에서 '게시글 관리', '갤러리 관리', '관련 사이트 관리' 메뉴 항목의 스타일이 다른 메뉴들과 일관되도록 수정 완료.
- **API 파일 TypeScript -> JavaScript 변환**:
  - `server/api/admin/db/` 경로의 `.ts` API 파일들을 `.js`로 변환 완료.
  - `server/api/user.js`의 `handleUpdate` 함수에서 `username` 필드를 업데이트 로직에서 제외하여 API 단에서 이름 변경을 방지했습니다.
- **테마 설정 기능 구현**: 
  - 일반 사용자 페이지의 헤더, 푸터, 배경 색상 (라이트/다크 모드별) 사용자 정의 기능 구현 완료.
  - 새로운 `SiteConfig` Prisma 모델 정의 및 마이그레이션 완료.
  - 테마 설정을 위한 API 엔드포인트 (`/api/admin/theme-settings`, `/api/theme-settings`) 구현 완료.
  - 관리자 테마 설정 UI를 `pages/adminpage/theme.vue`로 분리하고, 관리자 사이드바 메뉴에 링크 추가 완료.
  - `layouts/default.vue`, `components/Nav.vue`, `components/Footer.vue`를 업데이트하여 동적으로 테마 색상 적용 완료.
- **토스트 알림 시스템 구현**: 
  - `composables/useToast.js` 컴포저블 및 `components/common/Toast.vue` 컴포넌트를 통해 전역 토스트 알림 시스템 구축 완료.
  - 토스트 알림 위치를 페이지 상단 중앙으로 변경 완료.
  - 테마 설정 페이지 및 메뉴 관리 페이지에서 `alert` 대신 토스트 알림 사용으로 변경 완료.
- **관리자 페이지 UI 개선**: 
  - `layouts/admin.vue` 파일의 메인 헤더바 왼쪽에 사람 상반신 아이콘 추가 완료.
  - 관리자 페이지 링크 아이콘 클릭 시 헤더 고정을 즉시 해제하도록 소스를 수정했습니다.
- **토스트 알림 시스템 개선**: 
  - 토스트 알림에 애니메이션 효과를 추가하고, 새로운 알림이 열리면 이전 알림이 자동적으로 닫히도록 중복 방지 기능 구현 완료.
  - 토스트 애니메이션을 더 부드럽게 조정 완료.
- **테마 색상 적용 안정화**:
  - `layouts/default.vue` 및 `layouts/blog.vue`에서 `body` 태그에 직접 배경색을 적용하여 새로고침 시 배경색이 제대로 표시되지 않던 문제 해결 완료.
  - `assets/css/main.css` 파일에 `html`, `body` 요소의 기본 배경색을 설정하여 첫 로딩 시 흰색 화면 방지 완료.
- **테마 색상 실시간 적용 문제 해결**:
  - `layouts/default.vue` 및 `layouts/blog.vue`에서 `document.body.style.backgroundColor`를 직접 제어하는 로직을 제거하고, `@nuxtjs/color-mode` 모듈이 `html` 태그에 `dark` 클래스를 올바르게 추가하여 Tailwind CSS 규칙에 따라 배경색이 적용되도록 수정 완료.
  - `layouts/default.vue` 및 `layouts/blog.vue`에서 테마 색상을 결정하는 computed 속성(`currentHeaderColor`, `currentFooterColor`, `currentBackgroundColor`)에 `colorMode.preference` 대신 `colorMode.value`를 사용하여 실제 적용된 색상 모드를 기준으로 색상을 선택하도록 수정 완료.
- **프로젝트 아키텍처 분석 및 문서화**:
  - 시스템 아키텍처 뷰 다이어그램을 포함하여 프로젝트의 주요 구성 요소와 상호작용을 시각화했습니다.
  - 홈페이지 주요 기능 흐름 플로우차트를 도출하고 문서화했습니다.
  - 게시판 및 여러 페이지의 일반적인 기능 흐름 플로우차트를 도출하고 문서화했습니다.
  - `pages/english.vue`와 `pages/japanese.vue` 파일 분석을 통해 외국어 학습 기능의 존재를 확인하고, 해당 기능의 상세 흐름(텍스트 파일 가져오기, 문장 재생, 재생 제어 등)을 파악했습니다.
  - 시스템 유스케이스 다이어그램을 액터와 유스케이스 정의와 함께 생성하여 시스템의 기능적 요구사항을 명확히 했습니다.
- **갤러리 관리 기능 개선 및 분류 필드 추가**:
  - `components/admin/AdminGalleryWrite.vue` 파일에 갤러리 분류(`galleryType`) 필드를 추가했습니다.
  - `form` 객체에 `galleryType` 필드를 포함하도록 수정하고, `galleryItem` prop이 변경될 때 `type` 값으로 초기화되도록 했습니다.
  - `AdminGalleryWrite.vue` 템플릿에 갤러리 분류(`일반 갤러리`, `관리자 갤러리`)를 선택할 수 있는 `select` 박스를 추가했습니다.
  - 갤러리 항목 생성(`POST`) 및 수정(`PUT`) 시 `galleryType` 값을 API 요청 본문의 `type` 필드로 포함하도록 `handleSubmit` 함수를 수정했습니다.
  - 갤러리 항목 수정(`PUT`) API의 경로를 `/api/admin/gallery/[id]`에서 `/api/admin/gallery`로 변경하고, 요청 본문에 `id`를 포함하도록 수정했습니다.
- **관리자 페이지 및 방명록 UI 개선**:
  - **메뉴 관리 페이지 사용 방법 추가**: `pages/adminpage/menus.vue` 파일에 메뉴 추가, 수정, 삭제, 순서 변경 등 사용 방법을 안내하는 설명 섹션을 추가 완료.
  - **데이터베이스 관리 페이지 사용 방법 추가**: `pages/adminpage/database.vue` 파일에 모델 선택, 데이터 조회, 추가, 수정, 삭제 등 사용 방법을 안내하는 설명 섹션을 추가 완료.
  - **방명록 UI 수정**:
      - `pages/guestbook.vue`의 작성자, 비밀번호, 제목, 내용 입력 필드에 대해 다크 모드 시 배경색(`dark:bg-gray-900`), 테두리(`dark:border-gray-800`), 텍스트 색상(`dark:text-gray-400`)을 이미지와 일치하도록 변경 완료.
      - `assets/css/main.css` 파일의 `html, body` 태그에 적용된 다크 모드 기본 배경색을 `dark:bg-[#1A202C]`으로 변경하여 이미지에 보이는 더 어두운 색상으로 조정 완료.
      - `pages/guestbook.vue`의 방명록 제목 (`h1`)과 "새 글 작성" 제목 (`h2`)의 다크 모드 텍스트 색상을 흰색 (`dark:text-white`)으로 변경 완료.
- **공통 헤더바 타이틀 및 로고 관리 기능 구현**: `prisma/schema.prisma`의 `SiteConfig` 모델에 `siteTitle`과 `siteLogoUrl` 필드를 추가하고, 관련 API(get/put) 및 UI (`pages/adminpage/theme.vue`, `components/Nav.vue`)를 수정하여 사이트 제목과 로고 URL을 관리하고 표시할 수 있도록 했습니다.
- **Heroicons 로고 설정 기능 추가**: `prisma/schema.prisma`의 `SiteConfig` 모델에 `siteLogoIcon` 필드를 추가하고, `server/api/admin/theme-settings.get.js`, `server/api/admin/theme-settings.put.js`를 수정하여 이 새 필드를 조회하고 업데이트할 수 있도록 로직을 확장했습니다. `pages/adminpage/theme.vue`에 `siteLogoIcon` 입력 필드를 추가하여 Heroicons 이름을 설정할 수 있도록 했으며, `components/Nav.vue`를 수정하여 `siteLogoIcon` 값이 존재하면 `@iconify/vue`의 `Icon` 컴포넌트를 사용하여 해당 아이콘을 로고로 렌더링하도록 로직을 업데이트했습니다.
- **Heroicons 로고 표시 문제 해결**: `components/Nav.vue` 파일의 `useFetch` `default` 및 `transform` 옵션에 `siteLogoIcon` 필드를 추가하여 메인 상단 헤더에 Heroicons 로고 아이콘이 올바르게 표시되도록 수정 완료.
- **Heroicons 모달 다크 모드 대응**: `components/common/HeroiconPickerModal.vue` 파일에서 `modal-container`의 하드코딩된 배경색과 그림자 스타일을 제거하여 Tailwind CSS의 다크 모드 클래스가 올바르게 적용되도록 수정 완료.
- **가로형 사이드바/세로형 헤더바 전환 기능 추가**: 메인 페이지(`pages/index.vue`)에서 방향 전환 아이콘 클릭 시 전체 페이지 레이아웃이 가로형 사이드바와 세로형 헤더바 모드 사이를 토글 형식으로 전환하도록 구현 완료. 이 기능은 주로 레이아웃 파일 및 핵심 UI 컴포넌트(`components/Nav.vue`, `components/Sidebar.vue` 등)에 구현되었습니다.
- **AI 채팅 페이지 개선**:
  - `pages/ai-chat.vue`에 '기다리는 중...' 메시지 옆에 스피닝 바와 함께 응답 대기 시간을 `1.xx` 초 형식으로 표시하는 기능을 추가 완료.
  - `utils/dateFormatter.js`에 초 단위 유닉스 타임스탬프를 처리하는 `formatUnixTimestamp` 함수를 추가하고, `pages/ai-chat.vue`에서 이를 사용하여 날짜를 올바르게 포맷팅하도록 리팩터링 완료. 

- **갤러리 관리 페이지 및 API 개선**:
  - `pages/adminpage/gallery.vue` 파일을 `pages/adminpage/gallery/index.vue`로 이름 변경 및 내용 복원하여 Nuxt.js 라우팅 규칙에 맞게 `/adminpage/gallery` 경로를 처리하도록 했습니다.
  - `pages/adminpage/gallery/[id].vue` 파일을 `pages/adminpage/gallery/view.vue`로 이름 변경하여 상세 페이지 라우팅을 명확히 했습니다.
  - `pages/adminpage/gallery/index.vue`에서 상세 페이지로 이동 시 `item.id`를 라우트 파라미터 대신 쿼리 파라미터로 전달하도록 `viewItemDetail` 함수를 수정했습니다.
  - `pages/adminpage/gallery/view.vue`에서 갤러리 ID를 라우트 파라미터 대신 쿼리 파라미터에서 가져오도록 수정했습니다.
  - 중복된 `pages/adminpage/gallery/[id].vue` 파일을 삭제하여 파일 시스템을 정리했습니다.
  - `server/api/admin/gallery/[id].get.js` 파일의 내용을 `server/api/admin/gallery/get.js` 파일에 통합하고, `[id].get.js` 파일을 삭제했습니다. 이제 `server/api/admin/gallery/get.js`가 단일 항목 및 목록 조회를 모두 처리합니다.
  - `pages/adminpage/gallery/index.vue` 파일에서 `TypeError: Cannot read properties of undefined (reading 'length')` 오류를 해결하기 위해 `item.tags?.join(', ')`와 같이 옵셔널 체이닝을 적용하여 `tags`가 `undefined`일 경우 발생할 수 있는 문제를 방지했습니다.

- **메모리 뱅크 구조 변경 및 파일 이동**:
  - `.cursor/rules` 폴더의 모든 `.mdc` 파일을 `memory-bank` 폴더로 이동하고, 확장자를 `.md`로 변경 완료.
  - `.cursor/rules/api-docs` 폴더를 `memory-bank`로 이동하고, 해당 폴더 내의 모든 `.mdc` 파일들의 확장자를 `.md`로 변경 완료.

- **Playwright를 통한 웹사이트 탐색 및 기능 테스트**:
  - `localhost:3000`으로 웹 브라우저를 실행하고 페이지 제목이 "Dion"임을 확인 완료.
  - 상단 헤더의 '홈', '블로그', '문의', '갤러리', '위키', '관련 사이트', '종합 검색', '아웃라이너', 'AI 채팅', '유튜브 갤러리' 등 모든 메뉴 링크를 클릭하여 페이지 이동 및 에러 발생 여부 확인 완료. 모든 링크에서 정상적으로 페이지가 로드되고 에러가 없음을 확인 완료.
  - 사이드바 토글 아이콘 (라이트/다크 모드 전환 버튼) 클릭을 시도했으나 요소가 뷰포트 밖에 있어 `TimeoutError`가 발생했으며, 브라우저 창 크기를 1280x800으로 조절하여 사이드바 요소가 보이도록 조치 완료.
  - 게시판 메뉴의 '자유게시판' 링크를 클릭하여 목록 페이지로 이동 완료.
  - 목록 페이지에서 특정 게시글("wqdqw" 제목)을 클릭하여 보기 페이지로 이동 완료.
  - 보기 페이지에서 '새 글 작성' 버튼 클릭 시 `TimeoutError`가 발생하여, '목록으로' 링크를 통해 목록 페이지로 돌아왔으며, 다시 '새 글 작성' 버튼을 클릭하여 작성 페이지로 이동하고 '테스트 게시글 제목'을 입력 완료.

- **Vue 컴포넌트 함수 주석 추가**: `components` 디렉토리 하위의 모든 `.vue` 파일과 `pages/board/view.vue`, `pages/board/index.vue` (관련 `BoardView.vue`, `BoardIndex.vue` 포함) 파일 내의 함수들에 JSDoc 스타일 주석을 성공적으로 추가 완료. 이 작업은 컴포넌트의 가독성과 유지보수성을 향상시켰습니다.

- **글래스모피즘 디자인 적용 및 개선**:
  - `pages/index.vue`의 메인 컨테이너와 "섹션 선택" 영역에 `glass-container` 및 `glass-section` 클래스를 추가하여 글래스모피즘 디자인을 적용했습니다.
  - Nuxt.js 레이아웃의 배경색 문제로 인해 `layouts/default.vue`에 `bg-gray-900` 클래스를 추가하여 어두운 배경을 적용했습니다. (이후 사용자 요청으로 제거됨)
  - 사용자 요청에 따라 `layouts/default.vue`에서 `bg-gray-900` 클래스를 제거하여 배경색을 원래대로 복원했습니다.
  - 메인 페이지의 뒷배경 유리 효과 제거 요청에 따라 `pages/index.vue`에서 `glass-container`, `glass-section` 클래스 및 관련 CSS를 제거했습니다.
  - 갤러리 페이지의 글래스모피즘 효과가 잘 보이도록 `layouts/default.vue`에 다시 `bg-gray-900` 배경색을 적용했습니다.
  - 라이트 모드일 때 글래스모피즘이 "어두운 유리"로 나타나도록 `pages/index.vue`의 `.glass-section`과 `components/PostList.vue`의 `.glass-list-effect`에 `rgba(0, 0, 0, 0.15)` 기반의 어두운 유리 스타일을 적용했습니다.
  - 라이트 모드에서 "어두운 유리" 느낌을 유지하되 `ghostwhite` 톤을 반영하기 위해 `pages/index.vue`의 `.glass-section`과 `components/PostList.vue`의 `.glass-list-effect`에 라이트 모드용 배경색을 `rgba(70, 75, 80, 0.15)`로, 테두리를 `rgba(70, 75, 80, 0.3)`로 변경했습니다. 최종적으로 이 어두운 유리 효과에 그라데이션을 추가하기 위해 `background-color`를 `linear-gradient(135deg, rgba(70, 75, 80, 0.15), rgba(50, 55, 60, 0.15))`로 변경했습니다.
  - 새로운 "Digital Agency" 홈페이지 디자인을 `public/publs/agency.html` 파일로 생성하여 기존 디자인을 유지한 채 해당 구조를 구현했습니다.

## 남은 작업
- **관리자 기능 - 콘텐츠 관리**:
  - 각 게시판 유형(공지, 유머, Q&A 등)에 대한 통합 게시글 관리 기능 구현.
- **콘텐츠 관리 고도화**:
  - **이미지 처리 방식 개선**: 현재 Base64 임베딩 방식의 단점(데이터 크기 증가)을 보완하기 위해, 향후 이미지 압축 또는 서버 업로드 및 CDN 연동 방식으로의 전환을 검토.
  - **비디오 삽입**: YouTube 등 외부 비디오 콘텐츠를 쉽게 삽입할 수 있는 기능 구현.
  - **자동 저장**: 사용자가 작성 중인 콘텐츠를 주기적으로 자동 저장하는 기능 구현.
  - **실시간 협업 기능**: 여러 사용자가 동시에 동일한 콘텐츠를 작성하거나 편집할 수 있는 기능 구현.
  - **관리자 페이지 - 게시글 관리 기능**: 게시글 작성, 수정, 삭제 등의 기능을 통합하여 관리하는 기능 구현.
- **테스트 및 최적화**:
  - 핵심 기능에 대한 단위/통합 테스트 코드 작성.
  - 데이터베이스 쿼리 성능 최적화 및 인덱싱 전략 검토.
  - 프론트엔드 성능(로딩 속도, 렌더링) 최적화.
- **사용자 정보**:
  - 사용자 정보 수정 기능의 상세 로직 구현.

## 알려진 이슈
- **성능**: 대용량 데이터 조회 시 API 응답 시간이 길어질 수 있어 페이지네이션 및 쿼리 최적화가 필요함.
- **보안**: 현재 기본적인 RBAC만 구현되어 있어, 추가적인 보안(XSS, CSRF 방지, 입력값 검증 강화 등) 조치가 필요함.
- **데이터 크기**: 에디터에서 이미지를 Base64로 저장함에 따라, 이미지 사용이 많은 게시물의 경우 DB 필드 크기가 비약적으로 커질 수 있음. 이는 DB 성능 및 백업/복구 시간에 영향을 줄 수 있음.
- **데이터베이스 백업**: 데이터베이스에 대한 정기적인 백업 및 복구 전략 수립이 필요함.

## 진행 중인 작업
1. **기능 테스트 및 안정화**
   - 새로 추가된 답변 기능에 대한 통합 테스트.
   - 전반적인 시스템의 안정성 및 성능 검증.
   - 사용자 피드백을 수집하여 잠재적인 이슈 파악.

## 남은 작업
1. 기능 구현
   - 이미지 업로드 기능
   - 비디오 삽입 기능
   - 자동 저장 기능
   - 실시간 협업 기능
   - 관리자 페이지 - 게시글 관리 기능

2. 테스트 및 최적화
   - 단위 테스트 작성
   - 성능 테스트
   - 브라우저 호환성 테스트
   - 보안 테스트

3. 확장성
   - 마이크로서비스 아키텍처 설계
   - 데이터베이스 샤딩 구현
   - 캐시 시스템 도입
   - 로드 밸런싱 설정

## 알려진 이슈
1. 데이터베이스
   - Prisma 연결 최적화 필요
   - 쿼리 성능 개선 필요
   - 데이터 정합성 검증 필요
   - 백업 전략 수립 필요

2. API
   - 응답 시간 최적화 필요
   - 에러 처리 개선 필요
   - 보안 강화 필요

3. 보안
   - 인증/인가 시스템 강화
   - 데이터 암호화 구현
   - XSS/CSRF 방지
   - 입력 데이터 검증

- **작동 중인 기능**:
    - 역할 기반 접근 제어(RBAC)가 적용된 관리자 페이지
    - 관리자 페이지를 위한 사이드바 레이아웃
    - 관리자 페이지 내 메뉴 CRUD 및 드래그앤드롭 순서 변경 기능
    - 메뉴 관리를 위한 백엔드 API
    - 앱 시작 시 동적 메뉴 데이터 로딩
    - 동적 메뉴 렌더링을 위한 `AppMenu.vue` 컴포넌트

- **개발 예정 기능**:
    - 기존 `Nav.vue`의 정적 메뉴를 신규 `AppMenu.vue` 컴포넌트로 교체
    - 애플리케이션 전반에 걸친 메뉴 시스템 기능 테스트

- **알려진 이슈**:
    - 현재 알려진 이슈 없음.

## What Works

- **사용자 인증**:
  - 회원가입, 로그인, 로그아웃 기능이 정상적으로 작동합니다.
  - `useAuth` composable을 통해 전역 상태가 일관되게 관리됩니다.
  - 관리자로 로그인 시, 관리자 전용 메뉴가 올바르게 표시됩니다.
  - 관리자 전용 페이지에 대한 접근 제어가 정상적으로 작동합니다.
- **메뉴 시스템**:
  - 데이터베이스 기반의 동적 메뉴 시스템이 작동합니다.
  - 사용자의 역할(public, user, admin)에 따라 접근 가능한 메뉴가 동적으로 표시됩니다.
- **데이터 페칭**:
  - `useFetch`를 사용한 컴포넌트들이 Nuxt 권장 방식에 따라 데이터를 올바르게 가져옵니다.
  - `BlogIndex.vue` 등에서 발생하던 `useFetch` 관련 경고가 해결되었습니다.
- **UI 및 라우팅**:
  - 전반적인 UI 렌더링 및 페이지 라우팅이 정상적으로 작동합니다.
  - `to="#"`로 인한 Vue Router 경고가 해결되었습니다.

## What's Left to Build

- **게시판 및 갤러리**:
  - 댓글 및 답글 기능의 전체적인 안정성 검토가 필요합니다.
  - 파일 업로드 및 관리 기능 구현이 필요합니다.
- **사용자 정보**:
  - 사용자 정보 수정 기능의 상세 로직 구현이 필요합니다.
- **관리자 기능**:
  - 게시글 관리 기능 구현이 필요합니다.

## Known Issues

- 현재 알려진 주요 이슈는 없습니다. 최근 사용자 관리 기능 구현 및 관련 디버깅을 통해 여러 문제를 해결했습니다.

## Blockers

- 현재 개발을 막는 특별한 블로커는 없습니다. 

- **유튜브 갤러리 크게 보기 화면 TODO 생성**: 사용자의 요청에 따라 `pages/youtube-gallery.vue` 파일에 유튜브 크게 보기 화면 구현을 위한 TODO 목록을 주석 형태로 성공적으로 추가 완료.

- **아웃라이너 (`outliner.vue`) 기능 및 디자인 개선**:
  - **엔터 키로 형제 노드 생성 및 백스페이스로 빈 노드 삭제 구현**: `components/OutlineItem.vue`와 `pages/outliner.vue`를 수정하여 엔터 키로 새 형제 노드를 생성하고, 내용이 비어 있을 때 백스페이스 키로 노드를 삭제하며, 포커스를 적절히 이동시키는 기능을 성공적으로 구현 완료. 자식 노드가 있는 경우 삭제를 방지하고 경고 메시지를 표시하는 로직도 구현 완료.
  - **미리보기 창 리사이즈 기능 구현**: `pages/outliner.vue` 파일에 리사이즈 핸들러 UI와 관련 로직(`startResize`, `doResize`, `stopResize` 함수)을 추가하여 아웃라이너 섹션과 상세 화면 섹션의 너비를 동적으로 조절하고 `localStorage`에 저장/로드하는 기능을 성공적으로 구현 완료.
  - **글래스모피즘 디자인 적용**: `pages/outliner.vue`에 `glass-outline-section` 클래스를 추가하고 관련 CSS 스타일을 적용하여 아웃라이너 섹션에 글래스모피즘 디자인을 성공적으로 적용 완료.
  - **경고창 팝업 모달로 변경**: `useModal` 컴포저블을 활용하도록 `pages/outliner.vue`를 수정하여 기존 경고창을 딤 처리된 팝업 모달로 성공적으로 변경 완료. 