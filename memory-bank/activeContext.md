---
description: 
globs: 
alwaysApply: true
---
# 현재 작업 컨텍스트

## 현재 작업 초점
- **시스템 안정화 및 UI/UX 개선**: Quill 에디터 기능 고도화 완료, 관리자 페이지 UI/기능 개선, 전반적인 다크 모드 구현 및 아웃라이너 오류 수정을 통해 시스템 안정성과 사용자 경험을 향상하는 데 초점을 맞추고 있습니다.

## 최근 변경 사항
1.  **Quill 에디터 기능 고도화**
    - **다중 이미지 업로드 및 Base64 임베딩**: 사용자가 여러 이미지를 선택하면, 파일들을 Base64 문자열로 변환하여 에디터 콘텐츠에 직접 삽입하는 기능을 구현했습니다. 이로써 별도의 서버 사이드 업로드 로직 없이 이미지를 콘텐츠의 일부로 관리할 수 있게 되었습니다.
    - **이미지 편집 기능 추가**: `quill-resize-module` 라이브러리를 도입하여, 에디터 내에서 사용자가 직접 이미지 크기를 조절하고, 이미지를 삭제하거나 다른 이미지로 교체할 수 있는 기능을 추가했습니다.
    - **SSR 호환성 확보**: 클라이언트 사이드에서만 동작하는 라이브러리로 인해 발생하던 서버 사이드 렌더링(SSR) 오류를 `onMounted` 훅과 동적 `import()`를 사용하여 해결했습니다.
    - `components/PostList.vue`에서 답변 글일 경우 제목 왼편에 답변 기호(↳)를 추가하여 시각적 구분을 명확히 했습니다.
    - `components/gallery/GalleryModal.vue`에서 화살표 아이콘이 이미지에 가려지지 않도록 `z-index`를 조정하고, 반투명 처리 및 스크롤 고정을 통해 사용자 경험을 개선했습니다.

2.  **관리자 페이지 기능 및 UI 개선**
    - **DB 관리**: Prisma 스키마를 동적으로 분석하여 모든 DB 모델에 대한 CRUD UI를 제공하는 기능을 구현했습니다.
    - **사용자 관리**: 사용자 목록 조회(페이지네이션, 검색, 정렬 포함), 생성, 수정, 삭제, 비밀번호 재설정 등 전체 관리 시스템을 구현했습니다.
    - **동적 메뉴 관리**: 데이터베이스 기반으로 메뉴를 생성하고, 드래그앤드롭으로 순서를 변경하는 등 동적 메뉴 시스템을 완성했습니다.
    - **게시글 관리 기능 확장**: `/adminpage/posts` 페이지를 확장하여 게시판 유형별(자유, 유머, Q&A) 게시글 목록 조회, 상세 조회, 생성, 수정, 삭제 기능을 구현했습니다.
        - `server/api/admin/posts/index.get.js`: 게시판 유형별 게시글 목록을 페이지네이션, 검색, 정렬(최신순)과 함께 조회합니다.
        - `server/api/admin/posts/[id].get.js`: 특정 게시글의 상세 정보를 조회합니다.
        - `server/api/admin/posts/index.post.js`: 새 게시글을 생성합니다.
        - `server/api/admin/posts/[id].put.js`: 기존 게시글을 수정합니다.
        - `server/api/admin/posts/[id].delete.js`: 특정 게시글을 삭제합니다.
        - `components/admin/AdminBoardIndex.vue`: `BoardIndex.vue`를 기반으로 관리자 게시글 목록에 특화된 컴포넌트를 생성하여 통합했습니다.
        - `pages/adminpage/posts/view.vue`: 게시글 상세 페이지를 구현하여 수정 및 삭제 기능을 제공합니다.
        - `pages/adminpage/posts/write.vue`: 게시글 작성 및 수정 페이지를 구현했습니다.
        - `server/utils/boardTypeMapper.js`: 게시판 유형과 Prisma 모델 및 설정 정보를 매핑하는 유틸리티를 구현했습니다.
        - 초기 `posts.get.js` 파일로 인한 라우팅 충돌 문제를 해결했습니다.

    - **갤러리 관리 기능 개선**: `components/admin/AdminGalleryWrite.vue`에 갤러리 분류 필드를 추가하고, 갤러리 항목 생성 및 수정 시 API 요청에 해당 분류 정보가 포함되도록 수정했습니다. 또한, 수정 API의 경로를 `/api/admin/gallery/[id]`에서 `/api/admin/gallery`로 변경하고 요청 본문에 `id`를 포함하도록 개선했습니다.

    - **다크 모드 스타일 적용**: `pages/adminpage/index.vue`, `pages/adminpage/database.vue`, `pages/adminpage/menus.vue`, `pages/adminpage/posts.vue` 등 주요 관리자 페이지에 다크 모드에 맞는 텍스트 및 UI 요소 색상 스타일을 적용했습니다.
    - **관리자 페이지 사이드바 메뉴 정렬 수정**: `layouts/admin.vue` 파일에서 '게시글 관리', '갤러리 관리', '관련 사이트 관리' 메뉴 항목의 스타일이 다른 메뉴들과 일관되도록 수정했습니다.

3.  **핵심 시스템 안정화 및 UI/UX 개선**
    - **인증 시스템**: `useAuth` composable을 리팩터링하여 전역 인증 상태 관리 로직을 안정화하고 관련 버그를 해결했습니다. 관리자로 로그인 시 헤더 업데이트 및 관리자 페이지 접근 이슈 해결.
    - **다크 모드 구현**: `@nuxtjs/color-mode` 모듈과 Tailwind CSS `darkMode: 'class'`를 활용하여 관리자 페이지 포함 전반적인 애플리케이션의 다크/라이트/시스템 모드 연동 및 UI 스타일을 성공적으로 적용했습니다. 관리자 페이지 헤더에 모드 전환 아이콘을 추가했습니다.
    - **아웃라이너 페이지 오류 수정**: `vuedraggable`의 `TypeError: Cannot read properties of null (reading 'id')` 오류 해결을 위해 `pages/outliner.vue`의 `handleDragStart` 함수에서 `id`를 `parseInt`로 변환하던 로직을 제거했습니다. 최상위 노드 드래그앤드롭 재정렬 문제를 해결하기 위해 `pages/outliner.vue`와 `components/OutlineItem.vue`의 `draggable` 컴포넌트 `group` 속성을 `{ name: 'outline-group', pull: true, put: true }`로 명시적 객체 형태로 변경했습니다. `pages/outliner.vue`의 최상위 `draggable` 컴포넌트 내 `template #item` 슬롯에서 `OutlineItem`을 감싸던 불필요한 `<div>` 태그를 제거했으며, 진단 목적으로 `pages/outliner.vue`의 최상위 `draggable` 컴포넌트에서 `handle=".drag-handle"` 속성을 임시 제거하고 `checkDragMove` 함수 내부의 유효성 검사 로직을 임시 주석 처리했습니다. 브레드크럼 경로가 올바르게 표시되지 않던 문제 해결을 위해 `pages/outliner.vue`에 `findPathToItem` 함수를 추가하고 `zoomToItem` 함수를 수정하여 선택된 아이템의 전체 경로를 정확하게 반영하도록 했습니다.
    - **Nuxt/Vue 경고 메시지 해결**: `useFetch` 경고 (`BlogIndex.vue`), `showMobileCategory` 경고 (`blog.vue`), Vue Router `to="#"` 경고 (`AppMenu.vue`), 그리고 `OutlineItem.vue`의 `@copy`, `@paste`, `@change` 이벤트 바인딩 오류(직접 `emit` 함수를 호출하도록 수정) 등 다양한 경고 메시지를 해결하여 시스템 안정성을 높였습니다.
    - **UI 연동**: `components/Nav.vue`를 수정하여 관리자 계정 로그인 시 헤더에 관리자 페이지 이동 아이콘이 표시되도록 개선했습니다.
    - **게시판 UI**: `components/PostList.vue`에서 답변 글일 경우 제목 왼편에 답변 기호(↳)를 추가하여 시각적 구분을 명확히 했습니다.
    - **갤러리 모달**: `components/gallery/GalleryModal.vue`에서 화살표 아이콘이 이미지에 가려지지 않도록 `z-index`를 조정하고, 반투명 처리 및 스크롤 고정을 통해 사용자 경험을 개선했습니다.

4.  **회원가입 기능 개선 및 강화**
    - `components/common/RegisterModal.vue` 파일의 주석 처리된 회원가입 폼을 활성화하여 사용자 입력이 가능하도록 했습니다.
    - 회원가입 성공 시 `useToast`를 사용하여 "회원가입이 완료되었습니다."라는 토스트 알림을 표시하도록 했습니다.
    - `server/api/user.js`의 `handleRegister` 함수에 사용자 이름과 이메일의 중복 확인 로직을 추가하여 중복 시 `409 Conflict` 에러를 반환하도록 했습니다.
    - 사용자 이름 중복 확인을 위한 새로운 API 엔드포인트 `server/api/user/check-username.get.js`를 생성하여 실시간 중복 확인 기능을 구현했습니다.
    - `components/common/RegisterModal.vue`에서 사용자 이름 입력 필드의 글자 색깔을 중복 확인 결과(사용 가능: 녹색, 중복: 빨간색)에 따라 동적으로 변경하도록 했습니다.
    - 이메일 및 비밀번호 입력 필드에 실시간 유효성 검사(이메일 형식, 비밀번호 길이 및 문자/숫자 포함)를 추가하고, 조건 만족 여부에 따라 글자 색상과 메시지(빨간색/녹색)를 표시하도록 했습니다.
    - 회원가입 모달을 닫았을 때, 모든 입력 필드(`username`, `email`, `password`) 및 관련 유효성 검사 상태를 초기화하도록 `components/common/RegisterModal.vue`에 `watch(isOpen, ...)` 로직을 추가했습니다.
    - "회원가입" 버튼이 사용자 이름 중복 확인 및 모든 필드의 유효성 검사를 통과해야만 활성화되도록 조건을 강화했습니다.

5.  **개인정보 수정 기능 개선**
    - `pages/personal-info.vue` 파일에서 "이름" 입력 필드를 `disabled` 처리하여 사용자가 수정할 수 없도록 했습니다.
    - `pages/personal-info.vue`의 비활성화된 "이름" 입력 필드에 `disabled:bg-gray-200 disabled:dark:bg-gray-900 cursor-not-allowed` Tailwind CSS 클래스를 추가하여 시각적으로 편집 불가능함을 명확히 했습니다.
    - `server/api/user.js`의 `handleUpdate` 함수에서 클라이언트로부터 전달되는 `username` 필드를 무시하고, `email`과 `password`만 업데이트되도록 API 로직을 수정하여 이름 변경을 서버 단에서도 방지했습니다.

6.  **관리자 페이지 헤더 고정 해제 기능 추가**
    - 관리자 페이지 링크 아이콘 클릭 시 헤더 고정을 즉시 해제하도록 소스를 수정했습니다.

7. **API 파일 TypeScript -> JavaScript 변환**
    - `server/api/admin/db/` 경로의 모든 `.ts` API 파일들이 `.js`로 변환되었습니다. 이 과정에서 발생한 TypeScript 관련 린터 오류를 수정하고 원본 `.ts` 파일은 삭제되었습니다.

8.  **테마 설정 기능 구현**
    - 일반 사용자 페이지의 헤더, 푸터, 배경 색상을 라이트/다크 모드에 따라 팔레트에서 선택하고 데이터베이스에 저장하는 기능을 구현했습니다.
    - `prisma/schema.prisma`에 `SiteConfig` 모델을 추가하여 `lightHeaderColor`, `darkHeaderColor`, `lightFooterColor`, `darkFooterColor`, `lightBackgroundColor`, `darkBackgroundColor` 필드를 정의하고 관련 데이터베이스 마이그레이션을 완료했습니다.
    - 관리자용 테마 설정 조회/업데이트 API (`server/api/admin/theme-settings.get.js`, `server/api/admin/theme-settings.put.js`)와 일반 사용자용 테마 설정 조회 API (`server/api/theme-settings.get.js`)를 구현하고 새로운 색상 필드를 처리하도록 업데이트했습니다.
    - 관리자 페이지의 테마 설정 UI를 `pages/adminpage/theme.vue` 경로로 분리하고, `layouts/admin.vue`의 사이드바에 해당 페이지로 이동하는 링크를 추가했습니다. 기존 `pages/adminpage/index.vue`에서는 테마 설정 UI를 제거했습니다.
    - `components/Nav.vue`와 `components/Footer.vue`가 색상 prop을 받도록 수정하고, `layouts/default.vue`에서 API를 통해 색상 설정을 불러와 현재 테마 모드에 따라 적절한 색상을 컴포넌트에 전달하도록 로직을 변경했습니다.

9.  **토스트 알림 시스템 구현**
    - 전역적으로 사용할 수 있는 토스트 알림 시스템을 `composables/useToast.js` 컴포저블과 `components/common/Toast.vue` 컴포넌트를 사용하여 구축했습니다.
    - `app.vue`에 `Toast.vue` 컴포넌트를 추가하여 `useToast` 컴포저블과 연결함으로써 전역적으로 토스트 알림을 사용할 수 있도록 설정했습니다.
    - 토스트 알림이 가로로 표시되도록 UI 위치를 조정했습니다.
    - 테마 설정 저장 시 (`pages/adminpage/theme.vue`) 및 메뉴 관리 페이지 (`pages/adminpage/menus.vue`)의 메뉴 이동, 추가/수정, 삭제 시 `alert` 창 대신 토스트 알림을 사용하도록 변경했습니다.

10. **관리자 페이지 UI 개선**
    - `layouts/admin.vue` 파일의 메인 헤더바 왼쪽에 사람 상반신 아이콘(`mdi:account`)을 추가하여 시각적인 구분을 명확히 했습니다.

11. **토스트 알림 시스템 개선**
    - `composables/useToast.js`를 수정하여 새로운 알림이 열리면 이전 알림이 자동으로 닫히도록 중복 방지 로직을 추가했습니다.
    - `components/common/Toast.vue`에 Vue `<Transition>` 컴포넌트와 개선된 CSS 트랜지션 (`all 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55)`)을 적용하여 토스트 알림의 나타남/사라짐 애니메이션을 더 부드럽게 개선했습니다.

12. **테마 색상 적용 안정화 및 초기 로딩 배경색 문제 해결**
    - `layouts/default.vue` 및 `layouts/blog.vue`에서 `onMounted` 훅 내부의 `fetchThemeSettings` 호출을 `await useFetch`로 변경하여 서버 사이드 렌더링(SSR) 시에도 테마 설정 데이터가 미리 로드되도록 수정했습니다.
    - `layouts/default.vue`의 최상위 `div`에서 불필요한 배경색 클래스를 제거하고, `document.body.style.backgroundColor`에 `currentBackgroundColor`를 `watch`하여 동적으로 적용하도록 로직을 변경했습니다.
    - `layouts/blog.vue`에도 `layouts/default.vue`와 동일하게 테마 설정 로직을 적용하여 헤더, 푸터, 배경색이 동적으로 반영되도록 했습니다.
    - `assets/css/main.css` 파일의 `html, body` 선택자에 `@apply bg-white dark:bg-gray-900;` 기본 배경색을 추가하여 첫 로딩 시 흰색 화면이 나타나는 문제를 해결했습니다.
    - `layouts/default.vue` 및 `layouts/blog.vue`에서 `document.body.style.backgroundColor`를 직접 제어하는 로직을 제거하고, `@nuxtjs/color-mode` 모듈이 `html` 태그에 `dark` 클래스를 올바르게 추가하여 Tailwind CSS 규칙에 따라 배경색이 적용되도록 최종 수정하여 시스템 색상 설정 시 배경색이 실시간으로 전환되지 않던 문제를 해결했습니다.
    - `layouts/default.vue` 및 `layouts/blog.vue`에서 테마 색상을 결정하는 computed 속성(`currentHeaderColor`, `currentFooterColor`, `currentBackgroundColor`)에 `colorMode.preference` 대신 `colorMode.value`를 사용하여 실제 적용된 색상 모드를 기준으로 색상을 선택하도록 수정하여 시스템 색상 설정 시 헤더바가 라이트 모드 기준으로 색상이 뜨던 문제를 해결했습니다.

13. **AI 채팅 페이지 개선**
    - `pages/ai-chat.vue`에 '기다리는 중...' 메시지 옆에 스피닝 바와 함께 응답 대기 시간을 `1.xx` 초 형식으로 표시하는 기능을 추가했습니다.
    - `utils/dateFormatter.js`에 초 단위 유닉스 타임스탬프를 처리하는 `formatUnixTimestamp` 함수를 추가하고, `pages/ai-chat.vue`에서 이를 사용하여 날짜를 올바르게 포맷팅하도록 리팩터링했습니다.

14. **외국어 학습 페이지 기능 분석 및 흐름 파악**
    - `pages/english.vue` 및 `pages/japanese.vue` 파일을 분석하여 두 페이지 모두 텍스트 파일을 가져와 문장을 음성으로 재생하는 '읽기 연습' 기능을 제공함을 확인했습니다.
    - 주요 기능은 텍스트 파일 업로드, 문장 목록 표시, 음성 재생(전체, 100문장, 체크된 항목, 개별 문장), 재생 제어(정지, 일시정지, 재개), 재생 설정(속도, 간격) 조절, 문장 리셋 등입니다.
    - 브라우저의 `SpeechSynthesis` API를 활용하며, 각 언어에 맞는 `utterance.lang` (en-US, ja-JP)을 사용합니다.

15. **갤러리 관리 페이지 및 API 개선**:
    - `pages/adminpage/gallery.vue` 파일을 `pages/adminpage/gallery/index.vue`로 이름 변경 및 내용 복원하여 Nuxt.js 라우팅 규칙에 맞게 `/adminpage/gallery` 경로를 처리하도록 했습니다.
    - `pages/adminpage/gallery/[id].vue` 파일을 `pages/adminpage/gallery/view.vue`로 이름 변경하여 상세 페이지 라우팅을 명확히 했습니다.
    - `pages/adminpage/gallery/index.vue`에서 상세 페이지로 이동 시 `item.id`를 라우트 파라미터 대신 쿼리 파라미터로 전달하도록 `viewItemDetail` 함수를 수정했습니다.
    - `pages/adminpage/gallery/view.vue`에서 갤러리 ID를 라우트 파라미터 대신 쿼리 파라미터에서 가져오도록 수정했습니다.
    - 중복된 `pages/adminpage/gallery/[id].vue` 파일을 삭제하여 파일 시스템을 정리했습니다.
    - `server/api/admin/gallery/[id].get.js` 파일의 내용을 `server/api/admin/gallery/get.js` 파일에 통합하고, `[id].get.js` 파일을 삭제했습니다. 이제 `server/api/admin/gallery/get.js`가 단일 항목 및 목록 조회를 모두 처리합니다.
    - `pages/adminpage/gallery/index.vue` 파일에서 `TypeError: Cannot read properties of undefined (reading 'length')` 오류를 해결하기 위해 `item.tags?.join(', ')`와 같이 옵셔널 체이닝을 적용하여 `tags`가 `undefined`일 경우 발생할 수 있는 문제를 방지했습니다.

16. **관리자 페이지 및 방명록 UI 개선**:
    - **메뉴 관리 페이지 사용 방법 추가**: `pages/adminpage/menus.vue` 파일에 메뉴 추가, 수정, 삭제, 순서 변경 등 사용 방법을 안내하는 설명 섹션을 추가했습니다.
    - **데이터베이스 관리 페이지 사용 방법 추가**: `pages/adminpage/database.vue` 파일에 모델 선택, 데이터 조회, 추가, 수정, 삭제 등 사용 방법을 안내하는 설명 섹션을 추가했습니다.
    - **방명록 UI 수정**:
        - `pages/guestbook.vue`의 작성자, 비밀번호, 제목, 내용 입력 필드에 대해 다크 모드 시 배경색(`dark:bg-gray-900`), 테두리(`dark:border-gray-800`), 텍스트 색상(`dark:text-gray-400`)을 이미지와 일치하도록 변경했습니다.
        - `assets/css/main.css` 파일의 `html, body` 태그에 적용된 다크 모드 기본 배경색을 `dark:bg-[#1A202C]`으로 변경하여 이미지에 보이는 더 어두운 색상으로 조정했습니다.
        - `pages/guestbook.vue`의 방명록 제목 (`h1`)과 "새 글 작성" 제목 (`h2`)의 다크 모드 텍스트 색상을 흰색 (`dark:text-white`)으로 변경했습니다.

17. **공통 헤더바 타이틀 및 로고 관리 기능 구현**: `prisma/schema.prisma`의 `SiteConfig` 모델에 `siteTitle`, `siteLogoUrl` 필드를 추가하고, `server/api/admin/theme-settings.get.js`, `server/api/admin/theme-settings.put.js`, `server/api/theme-settings.get.js` API를 수정하여 이 필드들을 조회 및 업데이트할 수 있도록 확장했습니다. 관리자 UI(`pages/adminpage/theme.vue`)에 '사이트 기본 설정' 섹션을 추가하고, `siteTitle`과 `siteLogoUrl` 입력 필드를 연동했습니다. `components/Nav.vue`를 수정하여 `siteLogoIcon` 값이 존재하면 `@iconify/vue`의 `Icon` 컴포넌트를 사용하여 해당 아이콘을 로고로 렌더링하도록 변경했습니다.
    - **Heroicons 로고 설정 기능 추가**: `prisma/schema.prisma`의 `SiteConfig` 모델에 `siteLogoIcon` 필드를 추가하고, `server/api/admin/theme-settings.get.js`와 `server/api/admin/theme-settings.put.js`를 수정하여 이 새 필드를 조회하고 업데이트할 수 있도록 로직을 확장했습니다. `pages/adminpage/theme.vue`에 `siteLogoIcon` 입력 필드를 추가하여 Heroicons 이름을 설정할 수 있도록 했으며, `components/Nav.vue`를 수정하여 `siteLogoIcon` 값이 존재하면 `@iconify/vue`의 `Icon` 컴포넌트를 사용하여 해당 아이콘을 로고로 렌더링하도록 로직을 업데이트했습니다.

18. **Heroicons 로고 표시 문제 해결**: `components/Nav.vue` 파일의 `useFetch` `default` 및 `transform` 옵션에 `siteLogoIcon` 필드를 추가하여 메인 상단 헤더에 Heroicons 로고 아이콘이 올바르게 표시되도록 수정했습니다.

19. **Heroicons 모달 다크 모드 대응**: `components/common/HeroiconPickerModal.vue` 파일에서 `modal-container`의 하드코딩된 배경색과 그림자 스타일을 제거하여 Tailwind CSS의 다크 모드 클래스가 올바르게 적용되도록 수정했습니다.

20. **가로형 사이드바/세로형 헤더바 전환 기능 추가**
    - **영향 파일**: 주로 레이아웃 관련 파일(예: `layouts/default.vue`) 및 핵심 UI 컴포넌트(`components/Nav.vue`, `components/Sidebar.vue` 또는 유사한 네비게이션 컴포넌트)에 구현되었습니다.
    - **활성화**: 메인 페이지(`pages/index.vue`)에서 이 기능이 활성화됩니다.
    - **작동 방식**: 방향 전환 아이콘을 클릭하면 전체 페이지 레이아웃이 '가로형 사이드바' 모드와 '세로형 헤더바' 모드 사이를 토글 형식으로 전환합니다. 이 전환은 UI 상태 변화를 감지하고 Tailwind CSS 클래스 등을 동적으로 적용하여 시각적 변화를 이룹니다.

21. **메모리 뱅크 구조 변경 및 파일 이동**:
    - `.cursor/rules` 폴더의 모든 `.mdc` 파일을 `memory-bank` 폴더로 이동하고, 확장자를 `.md`로 변경했습니다.
    - `.cursor/rules/api-docs` 폴더를 `memory-bank`로 이동하고, 해당 폴더 내의 모든 `.mdc` 파일들의 확장자를 `.md`로 변경했습니다.

22. **Playwright를 통한 웹사이트 탐색 및 기능 테스트**:
    - `localhost:3000`으로 웹 브라우저를 실행하고 페이지 제목이 "Dion"임을 확인했습니다.
    - 상단 헤더의 '홈', '블로그', '문의', '갤러리', '위키', '관련 사이트', '종합 검색', '아웃라이너', 'AI 채팅', '유튜브 갤러리' 등 모든 메뉴 링크를 클릭하여 페이지 이동 및 에러 발생 여부를 확인했으며, 모든 링크에서 정상적으로 페이지가 로드되고 에러가 없음을 확인했습니다.
    - 사이드바 토글 아이콘 (라이트/다크 모드 전환 버튼) 클릭을 시도했으나 요소가 뷰포트 밖에 있어 `TimeoutError`가 발생했습니다.
    - 브라우저 창 크기를 1280x800으로 조절하여 사이드바 요소가 보이도록 했습니다.
    - 게시판 메뉴의 '자유게시판' 링크를 클릭하여 목록 페이지로 이동했습니다.
    - 목록 페이지에서 특정 게시글("wqdqw" 제목)을 클릭하여 보기 페이지로 이동했습니다.
    - 보기 페이지에서 '새 글 작성' 버튼 클릭 시 `TimeoutError`가 발생하여, '목록으로' 링크를 통해 목록 페이지로 돌아왔습니다.
    - 다시 '새 글 작성' 버튼을 클릭하여 작성 페이지로 이동했으며, '테스트 게시글 제목'을 입력했습니다.

23. **Vue 컴포넌트 함수 주석 추가**: `components` 디렉토리 하위의 모든 `.vue` 파일과 `pages/board/view.vue`, `pages/board/index.vue` (관련 `BoardView.vue`, `BoardIndex.vue` 포함) 파일 내의 함수들에 JSDoc 스타일 주석을 성공적으로 추가했습니다. 이 작업은 컴포넌트의 가독성과 유지보수성을 향상시켰습니다.

24. **글래스모피즘 디자인 적용 및 개선**
    - `pages/index.vue`의 메인 컨테이너와 "섹션 선택" 영역에 `glass-container` 및 `glass-section` 클래스를 추가하여 글래스모피즘 디자인을 적용했습니다.
    - Nuxt.js 레이아웃의 배경색 문제로 인해 `layouts/default.vue`에 `bg-gray-900` 클래스를 추가하여 어두운 배경을 적용했습니다. (이후 사용자 요청으로 제거됨)
    - 사용자 요청에 따라 `layouts/default.vue`에서 `bg-gray-900` 클래스를 제거하여 배경색을 원래대로 복원했습니다.
    - 메인 페이지의 뒷배경 유리 효과 제거 요청에 따라 `pages/index.vue`에서 `glass-container`, `glass-section` 클래스 및 관련 CSS를 제거했습니다.
    - 갤러리 페이지의 글래스모피즘 효과가 잘 보이도록 `layouts/default.vue`에 다시 `bg-gray-900` 배경색을 적용했습니다.
    - 라이트 모드일 때 글래스모피즘이 "어두운 유리"로 나타나도록 `pages/index.vue`의 `.glass-section`과 `components/PostList.vue`의 `.glass-list-effect`에 `rgba(0, 0, 0, 0.15)` 기반의 어두운 유리 스타일을 적용했습니다.
    - 라이트 모드에서 "어두운 유리" 느낌을 유지하되 `ghostwhite` 톤을 반영하기 위해 `pages/index.vue`의 `.glass-section`과 `components/PostList.vue`의 `.glass-list-effect`에 라이트 모드용 배경색을 `rgba(70, 75, 80, 0.15)`로, 테두리를 `rgba(70, 75, 80, 0.3)`로 변경했습니다. 최종적으로 이 어두운 유리 효과에 그라데이션을 추가하기 위해 `background-color`를 `linear-gradient(135deg, rgba(70, 75, 80, 0.15), rgba(50, 55, 60, 0.15))`로 변경했습니다.
    - 새로운 "Digital Agency" 홈페이지 디자인을 `public/publs/agency.html` 파일로 생성하여 기존 디자인을 유지한 채 해당 구조를 구현했습니다.

25. **유튜브 갤러리 크게 보기 화면 TODO 생성**
    - 사용자의 요청에 따라 `pages/youtube-gallery.vue` 파일에 유튜브 크게 보기 화면 구현을 위한 TODO 목록을 주석 형태로 추가했습니다.

26. **아웃라이너 (`outliner.vue`) 기능 및 디자인 개선**
    - **엔터 키로 형제 노드 생성 및 백스페이스로 빈 노드 삭제 구현**: `components/OutlineItem.vue`에 `@keydown.enter.prevent="handleEnter"`와 `ref="contentInput"`를 추가하고, `handleEnter`, `handleBackspace`, `focusInput` 메서드를 구현하여 새 형제 노드 생성 및 빈 노드 삭제 기능을 구현했습니다. `pages/outliner.vue`에 `outlineItemRefs` Map과 `setItemRef` 함수를 추가하고, `addBelowItem` 함수를 수정하여 새로 생성된 노드로 포커스를 이동시키며, `deleteItem` 함수를 수정하여 자식 노드가 있는 경우 삭제를 방지하고 경고 메시지를 표시하며 삭제 후 적절한 노드로 포커스를 이동시키는 로직을 구현했습니다.
    - **미리보기 창 리사이즈 기능 구현**: `pages/outliner.vue` 파일에 아웃라이너 섹션과 상세 화면 섹션 사이에 리사이즈 핸들러 UI를 추가했습니다. `outlineSectionRef`, `detailSectionRef`, `isResizing`, `initialPos`, `initialOutlineWidth`, `initialDetailWidth`, `outlineSectionWidth`, `detailSectionWidth`, `minSectionWidth`, `maxSectionWidth` 등의 `ref` 변수와 `startResize`, `doResize`, `stopResize` 함수를 구현하여 섹션 너비를 동적으로 조절하고 `localStorage`에 저장/로드하도록 했습니다.
    - **글래스모피즘 디자인 적용**: `pages/outliner.vue`의 아웃라이너 섹션과 상세 화면 섹션 `div`에 `glass-outline-section` 클래스를 적용하고, 해당 클래스에 `backdrop-filter`, `background-color`, `border`, `box-shadow` 등의 글래스모피즘 CSS 스타일을 추가했습니다.
    - **경고창 팝업 모달로 변경**: `components/common/Modal.vue` 컴포넌트가 `useModal` 컴포저블을 통해 전역적으로 상태를 관리함을 확인 후, `pages/outliner.vue`에서 기존 `Modal` 컴포넌트 직접 사용 및 관련 `ref`를 제거하고, `useModal` 컴포저블을 임포트하여 `deleteItem` 함수 내에서 `useModal`의 `openModal` 함수를 호출하도록 수정했습니다. 모달이 뜨지 않던 문제를 재확인하고 `deleteItem` 함수에서 `openModal`을 올바르게 호출하도록 다시 수정했습니다.

27. **코드 최적화 및 헬퍼 함수(Composables) 분리**:
    - `pages/youtube-gallery.vue`의 헬퍼 함수들(`getEmbedUrl`, `getThumbnailUrl`, `loadVideo`, `unloadVideo`, `getAspectRatioClass`)을 `composables/useYoutubeGallery.js`로 분리하여 코드 재사용성 및 관리 용이성을 개선했습니다.
    - `pages/outliner.vue`에서 `normalizeItemChildren` 함수를 `composables/useOutlineItems.js`로 분리하고, 유튜브 모달 관련 함수(`handleOpenYoutubeModal`, `handleCloseYoutubeModal`) 또한 `composables/useYoutubeGallery.js`로 이동했습니다. 아웃라이너의 핵심 데이터 상태와 항목 관리 로직(`outlineItems`, `currentOutlineItem`, `zoomHistory`, `rootItems`, `addItem`, `deleteItem`, `updateItem`, `moveItem`, `resetOutlineData`, `loadOutlineData`, `saveOutlineData`, `findPathToItem`)을 `composables/useOutlineData.js`로 분리하여 컴포저블 패턴을 적용했습니다.
    - `components/board/Pagination.vue`에서 `visiblePages` 계산 로직을 `composables/usePagination.js`로 분리하여 재사용성을 높였습니다.
    - `components/blog/BlogView.vue`에서 게시글 상세 데이터 로딩 로직을 `composables/useBlogPosts.js`로 분리하고, 게시글 삭제 로직에 `composables/useConfirmDelete.js`를 적용했습니다.
    - `composables/useBlogSubmit.js`를 더 범용적인 `composables/useFormSubmit.js`로 이름을 변경하고 폼 제출 및 유효성 검사 기능을 일반화했습니다. 이를 `components/blog/BlogWrite.vue`에 적용하여 게시글 작성/수정 로직을 리팩토링했습니다.
    - `components/board/BoardIndex.vue`의 게시물 목록 가져오기, 페이지네이션, 정렬, 검색, 무한 스크롤 관련 복잡한 로직을 `composables/useBoardPosts.js` 컴포저블로 통합하여 관리하도록 리팩토링했습니다.
    - `components/board/BoardView.vue`에서 게시글 상세 데이터 로딩 로직을 `composables/useBoardPostDetail.js`로 분리하고, 게시글 삭제 로직에 `useConfirmDelete.js`를 적용했습니다.
    - `components/board/BoardWrite.vue`의 폼 제출 로직을 `composables/useFormSubmit.js`를 사용하도록 리팩토링했습니다.

## 다음 단계
1.  **기능 안정성 검토 및 버그 수정**: 현재까지 구현된 모든 기능(특히 Quill 에디터, 관리자 페이지, 회원가입, 개인정보 수정)에 대한 종합적인 테스트를 수행하고 안정성을 확보합니다. 사용자 피드백을 수집하여 잠재적인 버그나 개선점을 수정합니다.
2.  **콘텐츠 관리 고도화 (장기 목표)**:
    - 이미지 Base64 저장 방식의 단점(데이터 크기)을 보완하기 위한 서버 업로드 또는 압축 기능 도입을 검토합니다.
    - 비디오 등 다양한 미디어 타입을 지원하는 방안을 모색합니다.
    - 자동 저장 기능을 구현하여 사용자 편의성을 높입니다.
3.  **테스트 및 최적화**: 핵심 기능에 대한 단위/통합 테스트 코드 작성, 데이터베이스 쿼리 성능 최적화 및 인덱싱 전략 검토, 프론트엔드 성능(로딩 속도, 렌더링) 최적화를 진행합니다.
4.  **사용자 정보 관리**: 이메일 변경 시 추가적인 확인 절차(예: 이메일 인증) 도입을 고려합니다.

## 현재 고려사항
- **성능**: Base64 이미지 사용 증가에 따른 DB 성능 및 네트워크 부하를 지속적으로 모니터링하고 최적화 방안을 모색해야 합니다.
- **보안**: 시스템 기능이 복잡해짐에 따라 추가적인 보안 취약점(XSS, CSRF 방지, 입력값 검증 강화 등) 점검 및 강화가 필요합니다.
- **데이터베이스 백업**: 데이터베이스에 대한 정기적인 백업 및 복구 전략 수립이 필요합니다. 

# AI 상호작용 규칙
- **말투 다양화**: 응답 시 동일하거나 유사한 어조 및 표현이 반복되지 않도록 주의합니다. 사용자에게 더 자연스럽고 풍부한 대화 경험을 제공하기 위해 다양한 어휘와 문장 구조를 사용합니다. 