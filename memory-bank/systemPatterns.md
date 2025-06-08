# 시스템 패턴

## 아키텍처 개요
- **프론트엔드**: Nuxt.js 기반의 SPA(Single Page Application)로, Vue.js 컴포넌트 시스템과 Tailwind CSS를 사용합니다.
- **백엔드**: Nuxt.js의 서버 엔진(Nitro)을 활용한 서버 사이드 로직을 구현하며, Prisma ORM을 통해 데이터베이스와 통신합니다.
- **API**: RESTful API 구조를 따르며, 사용자 인증은 JWT(JSON Web Token)를 기반으로 합니다.

## 핵심 디자인 패턴
### 1. 동적 스키마 기반 시스템 (DB 관리 기능)
- **패턴 설명**: 백엔드가 데이터베이스 스키마 자체를 동적으로 분석하여 프론트엔드에 제공하고, 프론트엔드는 이 스키마 정보를 바탕으로 UI(폼, 테이블 등)를 동적으로 생성하는 패턴입니다. 이는 DB 모델이 추가/변경되어도 코드 수정을 최소화하는 유연한 구조를 만듭니다.
- **구현**:
  - **백엔드 (API)**: `Prisma.dmmf` (Data Model Meta Format)를 사용하여 모델의 이름, 필드, 타입 등의 메타데이터를 추출합니다. 이 정보를 제공하는 API(`GET /api/admin/db/models`)와, 모델 이름을 동적 파라미터로 받아 CRUD를 수행하는 API(`[model]` 폴더 활용)를 구현했습니다.
  - **프론트엔드 (UI)**: 페이지 진입 시 스키마 메타데이터를 받아 저장합니다. 사용자가 특정 모델을 선택하면, 저장된 스키마를 참조하여 데이터 테이블의 헤더와 편집/생성 모달의 입력 폼을 동적으로 렌더링합니다.

### 2. 역할 기반 접근 제어 (RBAC) 및 라우팅
- **패턴 설명**: 미들웨어를 사용하여 특정 경로에 대한 접근 권한을 사용자의 역할(Role)에 따라 제어합니다.
- **구현**:
  - **미들웨어**: `middleware/admin-auth.js`에서 사용자의 `role`이 'admin'인지 확인하여 관리자 페이지 접근을 제어합니다.
  - **동적 레이아웃**: `middleware/layout.global.js`에서 접속 경로에 따라 일반 레이아웃 또는 관리자 레이아웃(`layouts/admin.vue`)을 동적으로 적용합니다.

### 3. 전역 상태 관리
- **패턴 설명**: Pinia 스토어와 Composables를 조합하여 애플리케이션의 전역 상태를 관리합니다.
- **구현**:
  - **Pinia**: 메뉴 목록(`stores/menu.js`)과 같이 서버로부터 비동기적으로 받아와 여러 컴포넌트에서 공유해야 하는 상태를 관리합니다.
  - **Composables**: 인증 정보(`composables/useAuth.js`)나 모달 상태(`composables/useModal.js`)와 같이 UI 상호작용과 밀접한 전역 상태를 관리하는 데 사용됩니다.

### 4. 재귀적 렌더링 (계층 구조 데이터)
- **패턴 설명**: 자기 자신을 재귀적으로 호출하는 컴포넌트를 만들어 메뉴-하위 메뉴와 같은 계층 구조의 데이터를 효과적으로 렌더링합니다.
- **구현**: `components/common/AppMenu.vue` 컴포넌트가 이 패턴을 사용하여 DB에 저장된 다단계 메뉴 구조를 표시합니다.

### 5. 다크 모드 구현 패턴
- **패턴 설명**: 사용자의 시스템 설정에 따라 애플리케이션의 UI 테마(라이트/다크)를 자동으로 전환하고, 수동 전환 기능도 제공합니다.
- **구현**:
  - `@nuxtjs/color-mode` 모듈을 사용하여 Nuxt.js 앱에서 시스템 색상 모드를 감지하고, `<html>` 태그에 `dark` 클래스를 자동으로 추가/제거합니다.
  - Tailwind CSS의 `darkMode: 'class'` 설정을 통해 `dark:` 프리픽스가 붙은 유틸리티 클래스(예: `dark:bg-gray-900`, `dark:text-white`)를 사용하여 다크 모드 스타일을 적용합니다.
  - `layouts/admin.vue`와 같은 전역 레이아웃 및 각 페이지/컴포넌트에서 이러한 `dark:` 클래스를 활용하여 일관된 테마를 유지합니다.
  - 관리자 페이지 상단 헤더에 `useColorMode`를 활용한 토글 아이콘을 추가하여 사용자가 라이트/다크/시스템 모드를 수동으로 전환할 수 있도록 합니다.

## 레이아웃 패턴 (Layouts 기반)
애플리케이션은 여러 레이아웃을 사용하여 다양한 페이지 유형에 대한 일관된 구조를 제공합니다. 각 레이아웃은 공통 UI 요소와 특정 페이지 그룹에 필요한 기능을 포함합니다.

- **`layouts/default.vue`**:
  - **역할**: 웹사이트의 기본 레이아웃으로, 대부분의 일반 페이지에 적용됩니다.
  - **구조**: `Nav`, `Footer`, `ScrollToTop` 컴포넌트를 포함합니다. 모바일 메뉴의 열림/닫힘 상태를 관리하며, 배경 오버레이를 통해 메뉴 활성화 시 사용자 상호작용을 제한합니다.
  - **테마 관리**: `useColorMode`와 `/api/theme-settings` API를 통해 서버에서 동적으로 가져온 테마 설정을 기반으로 헤더, 푸터의 색상을 동적으로 적용합니다.
- **`layouts/admin.vue`**:
  - **역할**: 관리자 페이지 전용 레이아웃입니다.
  - **구조**: 사이드바 메뉴(대시보드, 메뉴 관리, 사용자 관리, 게시글 관리, DB 관리, 테마 설정), 상단 헤더, 그리고 페이지 콘텐츠를 위한 슬롯을 포함합니다.
  - **테마 관리**: 상단 헤더에 다크 모드 토글 기능을 제공하여 사용자가 수동으로 테마를 전환할 수 있도록 합니다.
  - **스타일링**: 활성된 `NuxtLink`에 `router-link-exact-active` 클래스를 적용하여 시각적으로 강조합니다.
- **`layouts/aichat-layout.vue`**:
  - **역할**: AI 채팅 관련 페이지를 위한 레이아웃입니다.
  - **구조**: `default.vue`와 유사하게 `Nav`, `Footer`, `ScrollToTop` 컴포넌트를 포함하며, 모바일 메뉴 상태 및 동적 테마 설정을 관리합니다.
  - **특징**: `useNavStore`의 `isAlwaysOnTop` 상태에 따라 메인 콘텐츠 영역의 상단 패딩을 조절하여 헤더 고정 여부에 유연하게 대응합니다. 또한, `currentBackgroundColor`의 변화를 감지하여 `document.body`의 배경색을 동적으로 업데이트합니다.
- **`layouts/blog.vue`**:
  - **역할**: 블로그 관련 페이지를 위한 레이아웃입니다.
  - **구조**: `Nav`, `Footer`, `ScrollToTop` 컴포넌트와 함께, 블로그 콘텐츠 영역 옆에 `BlogSidebar`를 위한 사이드바를 포함합니다. 모바일 환경에서는 `MobileCategoryDropdown`을 조건부로 렌더링합니다.
  - **데이터 로딩**: `fetchCategories()` 함수를 통해 `/api/categories` API에서 카테고리 데이터를 비동기적으로 가져와 `BlogSidebar`에 전달합니다.
  - **상태 공유**: `provide('refreshCategories', fetchCategories)`를 사용하여 하위 컴포넌트에서 카테고리 목록을 갱신할 수 있는 기능을 제공합니다.

## 데이터 모델링 패턴
- **자기 참조 관계**: `BoardPost`(게시판)나 `Menu` 모델에서 `parentId` 필드를 사용하여 부모-자식 관계를 표현합니다. 이를 통해 답변글이나 하위 메뉴 같은 계층 구조를 구현합니다. `onDelete: Cascade` 옵션을 통해 부모 레코드 삭제 시 자식 레코드가 연쇄적으로 삭제되도록 하여 데이터 정합성을 유지합니다.
- **상태 관리 필드**: `User` 모델의 `isActive` 필드처럼, 데이터의 상태를 명시적으로 관리하는 필드를 두어 비즈니스 로직을 단순화합니다.

## 주의가 필요한 파일 (수정 시 영향 범위가 큰 파일)
- **`prisma/schema.prisma`**: 모든 데이터 모델의 원천 소스. 변경 시 관련된 모든 API와 UI에 영향을 미칩니다.
- **`nuxt.config.ts`**: 프로젝트의 빌드, 렌더링, 모듈 등 핵심 설정을 담고 있습니다.
- **`composables/useAuth.js`**: 전역 인증 상태를 관리하므로, 수정 시 모든 페이지의 인증 로직에 영향을 줄 수 있습니다.
- **`layouts/admin.vue`, `layouts/default.vue`**: 사이트의 기본 골격을 정의하는 파일입니다.

## 주요 파일 및 잠재적 사이드 이펙트
프로젝트의 특정 파일들은 수정 시 광범위한 사이드 이펙트를 유발할 수 있으므로 신중한 접근이 필요합니다.

1.  **데이터베이스 스키마 및 데이터 (`prisma/`, `seed.js`)**
    *   **`prisma/schema.prisma`**: 데이터 모델의 구조를 정의하며, 변경 시 관련된 모든 API와 프론트엔드 컴포넌트에 연쇄적인 영향을 미칩니다.
    *   **`seed.js`**: 초기 데이터를 생성하며, 잘못 수정하면 데이터 중복 및 오류를 유발할 수 있습니다.

2.  **전역 설정 및 중앙 관리 (`nuxt.config.ts`, `server/utils/prisma.js`)**
    *   **`nuxt.config.ts`**: 프로젝트의 핵심 설정 파일로, 작은 변경만으로도 빌드 실패나 렌더링 오류 등 전반적인 문제를 일으킬 수 있습니다.
    *   **`server/utils/prisma.js`**: Prisma 클라이언트를 중앙 관리하므로, 수정 시 모든 데이터베이스 접근 API의 동작에 영향을 줍니다.

3.  **데이터 변경 API (`server/api/**/*.js`)**
    *   `POST`, `PUT`, `PATCH`, `DELETE` 요청을 처리하는 API들은 데이터베이스 상태를 직접 변경하므로, 수정 시 데이터 무결성에 큰 영향을 미칩니다.

4.  **공유 상태 및 전역 로직 (`stores/`, `plugins/`)**
    *   **`stores/**/*.js`**: 여러 컴포넌트가 공유하는 상태를 관리하므로, 수정 시 관련된 모든 컴포넌트의 동작이 예상치 않게 변경될 수 있습니다.
    *   **`plugins/**/*.js`**: 앱 초기화 시 실행되는 전역 로직으로, 수정 시 앱 전체의 동작에 영향을 미칠 수 있습니다.

## 주요 기술 결정
1. 텍스트 에디터
   - Quill Editor 선택 이유
     * 풍부한 기능 지원
     * 커스터마이징 용이
     * 안정적인 성능
     * 마크다운 지원

2. 데이터베이스
   - Prisma ORM 선택 이유
     * 타입 안정성
     * 쉬운 마이그레이션
     * 효율적인 쿼리
     * 스키마 관리 용이

3. **게시판 답변 기능 구현 방식**
   - **데이터 구조**: `BoardPost` 모델 내에 `parentId` 필드를 추가하여 자기 참조(self-relation)를 통해 계층적 데이터 구조(원본 글-답변 글)를 구현.
   - **API 로직**:
     - 원본 글(`parentId`가 null)만 페이지네이션하여 조회 효율을 확보.
     - 조회된 원본 글 목록에 해당하는 답변 글들을 한 번의 추가 쿼리로 가져와 N+1 문제 방지.
     - 서버에서 원본 글과 답변 글을 조합하여 클라이언트에 전달함으로써 프론트엔드 부담 최소화.
     - 답변 글의 제목은 서버에서 동적으로 생성하여 데이터 일관성 유지.

## API 문서
- API 관련 문서는 `memory-bank/api-docs/` 디렉토리에 저장되어 있습니다.
- 각 파일은 API 엔드포인트, 요청/응답 형식, 그리고 사용 예제를 포함합니다.
- **관리자 기능 - 사용자 관리**:
  - 페이지네이션, 검색, 정렬, 필터링을 포함한 사용자 목록 조회 기능이 정상 작동합니다.
  - 사용자 추가, 수정, 삭제, 비밀번호 재설정, 계정 활성/비활성화 기능이 모달을 통해 정상적으로 작동합니다.
  - 모든 작업에 대한 피드백이 토스트 메시지로 제공됩니다.

## 인증 및 권한 관리

### `useAuth` Composable

- **위치**: `composables/useAuth.js`
- **역할**: 전역 인증 상태(로그인 여부, 사용자 정보)를 관리하고 관련 유틸리티 함수를 제공합니다.
- **구조**:
  - `useState`를 사용하여 전역 상태(`authState`)를 생성합니다.
  - `computed` 속성을 통해 반응형 상태 값을 외부로 노출합니다.
    - `isLoggedIn`: 사용자의 로그인 상태 (boolean)
    - `user`: 로그인된 사용자 정보 (object | null)
    - `isAdmin`: 사용자의 관리자 권한 여부 (boolean)
  - `setAuth(isLoggedIn, user)`: 인증 상태를 명시적으로 설정합니다.
  - `checkAuth()`: `/api/user?type=check` API를 호출하여 현재 세션의 유효성을 확인하고 상태를 갱신합니다. 서버에서 데이터를 가져와 로그인 여부와 사용자 정보를 업데이트합니다.

- **사용법**:
  ```javascript
  // script setup 내부
  import { useAuth } from '~/composables/useAuth';

  const { isLoggedIn, user, isAdmin, setAuth } = useAuth();
  
  // 템플릿에서는 ref의 .value 없이 바로 사용 가능
  // <p v-if="isLoggedIn">환영합니다, {{ user.username }}님!</p>
  
  // 스크립트 로직에서는 .value로 접근해야 함
  if (isAdmin.value) {
    console.log('관리자입니다.');
  }
  ```
- **리팩터링 이력**:
  - 초기에는 `useState`가 반환하는 `auth` ref를 포함한 객체 `{ auth, setAuth, ... }`를 반환했습니다.
  - 이 구조는 컴포넌트에서 `auth.auth.value.isLoggedIn`과 같이 복잡하게 접근해야 하는 불편함이 있었습니다.
  - `computed` 속성을 도입하여 `isLoggedIn`, `user`, `isAdmin`을 직접 반환하도록 개선하여, 컴포넌트에서 상태 값에 더 직관적으로 접근할 수 있게 되었습니다. 

## 전역 유틸리티 및 데이터 프로비저닝 (Composables 기반)

### 토스트 알림 시스템 (`composables/useToast.js`)
- **패턴 설명**: 애플리케이션 전반에 걸쳐 일시적인 사용자 피드백(성공, 오류, 경고, 정보 메시지)을 제공하는 전역 토스트 알림 시스템입니다. 이전 토스트를 자동으로 제거하고 새로운 토스트만 표시하여 UI 혼란을 방지합니다.
- **구현**: `showToast(message, type, duration)` 함수를 통해 메시지, 유형, 표시 시간을 설정하여 토스트를 표시합니다. `removeToast(id)`로 특정 토스트를 수동으로 제거할 수 있습니다.

### 모달 시스템 (`composables/useModal.js`, `composables/useReplyModal.js`, `composables/useLoginModal.js`, `composables/useRegisterModal.js`)
- **패턴 설명**: 범용적인 확인/알림 모달부터 특정 목적(댓글, 로그인, 회원가입)을 위한 모달까지, 다양한 모달 UI를 중앙에서 관리하고 제어하는 시스템입니다. 모달의 `isOpen` 상태, 제목, 내용, 확인 여부 및 콜백 함수를 통해 유연하게 모달 동작을 정의합니다.
- **구현**:
  - `useModal.js`: 가장 일반적인 모달 컴포저블로, `openModal(title, content, callback, confirm)`을 통해 다양한 유형의 모달을 생성합니다.
  - `useReplyModal.js`, `useLoginModal.js`, `useRegisterModal.js`: 특정 기능을 위해 디자인된 모달 컴포저블로, 해당 모달의 `isOpen` 상태와 관련 로직(예: `useReplyModal`의 `replyCallback`)을 관리합니다.

### 데이터 프로비저닝 컴포저블 (`composables/useImages.js`, `composables/usePosts.js`)
- **패턴 설명**: 주로 `/server/data` 디렉토리의 정적 데이터(예: 캐러셀 이미지, 블로그/게시판 포스트)를 프론트엔드 컴포넌트에서 쉽게 소비할 수 있도록 캡슐화하는 컴포저블입니다. 데이터를 `ref`로 래핑하여 반응성을 유지합니다.
- **구현**:
  - `useImages.js`: `getCarouselImages()` 함수를 통해 캐러셀에 사용될 이미지 데이터를 제공합니다.
  - `usePosts.js`: `getBlogPosts()` 및 `getBoardPosts()` 함수를 통해 블로그 및 게시판 포스트 데이터를 제공합니다.

## What's Left to Build

- **게시판 및 갤러리**:
  - 파일 업로드 및 관리 기능 구현이 필요합니다.
- **관리자 기능**:
  - 게시글 관리 기능 구현이 필요합니다.

## Known Issues

- 현재 알려진 주요 이슈는 없습니다.

## Blockers

- 현재 알려진 주요 블로커는 없습니다.

## 컴포넌트 패턴
- **모달 기반 CRUD**: `pages/adminpage/users.vue`와 같이 복잡한 CRUD(생성, 읽기, 수정, 삭제) 인터페이스를 구현할 때, 주 화면은 데이터 목록(테이블)을 표시하고 각 작업(생성, 수정, 삭제 확인 등)은 별도의 모달 컴포넌트(`components/admin/*.vue`)를 통해 처리합니다. 이 패턴은 UI를 깔끔하게 유지하고 각 기능의 관심사를 분리하는 데 효과적입니다.
- **공용 피드백 컴포넌트**: `components/common/Toast.vue`와 같이 애플리케이션 전반에서 사용될 수 있는 피드백 컴포넌트를 만들어 사용자 경험의 일관성을 높입니다. 이벤트 발생 시 페이지 레벨에서 토스트의 상태를 관리하여 메시지를 표시합니다.
- **명시적 컴포넌트 Import**: Nuxt의 컴포넌트 자동 임포트(`auto-import`) 기능이 예상대로 동작하지 않을 경우, `[Vue warn]: Failed to resolve component`와 같은 경고가 발생할 수 있습니다. 이 경우, 해당 컴포넌트를 사용하는 부모 컴포넌트의 `<script setup>` 블록 내에서 `import ComponentName from '~/components/path/to/ComponentName.vue'`와 같이 명시적으로 컴포넌트를 import하여 문제를 해결합니다.

### 6. 아웃라이너 항목 구조 (vuedraggable)
- **패턴 설명**: `vuedraggable` 컴포넌트 사용 시 `Item slot must have only one child` 오류를 방지하기 위해, 드래그 가능한 각 아이템의 슬롯(`template #item`) 내부가 항상 **단 하나의 최상위(root) HTML 요소**로 감싸여 있도록 명시적으로 구조화합니다.
- **구현**:
  - `pages/outliner.vue`의 메인 `draggable` 컴포넌트에서 `OutlineItem`을 `div`로 감쌌습니다.
  - `components/OutlineItem.vue` 내부의 중첩된 `draggable` 컴포넌트에서도 `OutlineItem`을 `div`로 감싸는 재귀적인 방식으로 이 패턴을 적용합니다. 이는 `vuedraggable`이 재귀적 구조에서 각 슬롯 항목을 올바르게 인식하도록 보장합니다.

### 5. Quill 에디터 이미지 처리 커스터마이징
- **패턴 설명**: 표준 이미지 업로드 기능을 사용하는 대신, 이미지를 Base64 문자열로 변환하여 에디터 콘텐츠에 직접 삽입하는 방식을 사용합니다. 또한, 클라이언트 사이드에서 이미지 크기 조절, 삭제, 교체 기능을 제공하여 사용자 경험을 향상시킵니다.
- **구현**:
  - **Base64 변환 및 다중 이미지 삽입**:
    - Quill 에디터의 `image` 핸들러를 오버라이드합니다.
    - 사용자가 파일을 선택하면 `FileReader`를 사용하여 각 이미지 파일을 읽고 Base64로 인코딩합니다.
    - 변환된 Base64 문자열을 `<img>` 태그의 `src` 속성으로 사용하여 에디터의 현재 커서 위치에 순차적으로 삽입합니다.
  - **이미지 리사이즈, 삭제, 교체**:
    - `quill-resize-module` 라이브러리를 동적 `import`를 통해 클라이언트 사이드에서만 로드하여 SSR(Server-Side Rendering) 오류를 방지합니다.
    - 모듈 등록 시 `replace` 옵션을 활성화하고, 커스텀 `handleReplace` 함수를 구현하여 이미지 교체 로직을 처리합니다.
    - 이 모듈은 사용자가 에디터 내의 이미지를 클릭했을 때 리사이즈 핸들, 삭제 버튼, 교체 버튼을 UI로 제공합니다.
  - **SSR 호환성 확보**:
    - `onMounted` 훅 내부에서 `quill-resize-module`을 `await import(...)` 구문을 사용하여 동적으로 가져옵니다.
    - `Quill.register`를 호출하기 전에 `window` 객체의 존재 여부를 확인하여 서버 사이드 렌더링 시 관련 코드가 실행되지 않도록 방지합니다.
- **장점**:
  - 별도의 이미지 저장/관리 서버가 필요 없어 아키텍처가 단순해집니다.
  - 모든 콘텐츠(텍스트+이미지)가 단일 데이터 필드에 저장되어 관리가 용이합니다.
- **단점**:
  - Base64 인코딩으로 인해 데이터의 크기가 약 33% 증가하여 DB 저장 공간 비효율 및 네트워크 부하를 유발할 수 있습니다. (향후 이미지 압축 또는 서버 업로드 방식으로 전환 고려 필요) 

## 스타일링 패턴 (Assets/CSS 기반)
- **`assets/css/main.css`**: Tailwind CSS의 `@tailwind` 지시문을 포함하며, 전역 `html`, `body` 스타일(min-height, 다크 모드 배경색 등) 및 메뉴 오픈 시 `pointer-events` 제어와 같은 핵심 전역 스타일을 정의합니다. `img` 태그에 `content-visibility: auto`를 적용하여 성능을 최적화합니다.
- **`assets/css/calendar.css`**: FullCalendar 라이브러리의 UI를 프로젝트 테마에 맞게 커스터마이징합니다. 버튼, 이벤트, 오늘 날짜 및 요일(`fc-day-today`, `fc-day-sun`, `fc-day-sat`)에 대한 스타일을 정의하며, 특히 다크 모드 환경에 대한 포괄적인 스타일(`dark` 클래스 사용)을 포함하여 일관된 시각적 경험을 제공합니다. 공휴일(`fc-day-holiday`) 스타일도 정의합니다.
- **`assets/css/quill-custom.css`**: Quill Editor의 기본 스타일을 오버라이드하고 확장합니다. 에디터 본문(`ql-editor`), 툴바(`ql-toolbar`), 컨테이너(`ql-container`)의 색상, 테두리, 아이콘(`ql-stroke`, `ql-fill`)에 대한 라이트/다크 모드 스타일을 정의합니다. 또한, 삽입된 비디오(`ql-video`)의 반응형 너비 및 비율을 설정하여 다양한 화면 크기에서 적절히 표시되도록 합니다. 

## 페이지 패턴 (Pages 기반)
애플리케이션의 각 페이지는 특정 기능을 제공하며, Nuxt.js의 페이지 기반 라우팅 시스템을 활용합니다. 다양한 데이터 로딩 전략과 UI 상호작용 패턴이 적용됩니다.

- **`pages/index.vue` (메인 페이지)**:
  - **역할**: 사용자가 다양한 콘텐츠 섹션(슬라이드, 게시판, 갤러리, 일기예보, 달력)을 동적으로 선택하고 볼 수 있는 메인 대시보드 역할을 합니다.
  - **구조**: 섹션 선택을 위한 체크박스 UI와 선택된 섹션에 따라 비동기적으로 해당 컴포넌트를 로드하는 `Suspense` 및 `defineAsyncComponent`를 사용합니다.
  - **상태 관리**: 선택된 섹션 목록을 로컬 스토리지에 저장하고 `watch`를 통해 변경 사항을 반영하여 사용자 선호도를 유지합니다.
  - **Pinia 연동**: `useGalleryStore`와 연동하여 갤러리 모달을 관리합니다.
  - **SEO**: `definePageMeta`를 사용하여 페이지 제목과 메타 설명을 설정합니다.

- **`pages/personal-info.vue` (개인정보 페이지)**:
  - **역할**: 로그인된 사용자의 개인 정보(이름, 이메일)를 표시하고, 이메일 및 비밀번호를 수정할 수 있는 기능을 제공합니다. 이름은 수정 불가능합니다.
  - **구현**: `isEditing` 반응형 상태를 사용하여 조회 모드와 편집 모드를 전환하는 UI 패턴을 구현합니다.
  - **데이터 관리**: `useFetch('/api/user?type=check')`를 사용하여 초기 사용자 정보를 가져오고, `useFetch('/api/user?type=update', { method: 'POST', body: ... })`를 통해 사용자 정보를 업데이트합니다. 비밀번호와 비밀번호 확인 필드의 클라이언트 측 유효성 검사를 수행합니다.
  - **UI/UX**: 이름 입력 필드는 `disabled` 속성과 Tailwind CSS의 `disabled:bg-gray-200 disabled:dark:bg-gray-900 cursor-not-allowed` 클래스를 적용하여 수정 불가를 시각적으로 명확히 합니다.
  - **라우팅/인증**: 로그인되지 않은 사용자는 `/login` 페이지로 리다이렉트됩니다.

### 관리자 페이지 패턴 (`pages/adminpage` 하위)
관리자 페이지는 `admin` 레이아웃과 `admin-auth` 미들웨어를 공통적으로 사용하며, 각 페이지는 특정 관리 기능을 담당합니다.

- **`pages/adminpage/index.vue` (관리자 대시보드)**:
  - **역할**: 관리자 섹션의 진입점으로, 간단한 대시보드 메시지를 표시합니다.
  - **구성**: `admin` 레이아웃과 `admin-auth` 미들웨어를 적용합니다.

- **`pages/adminpage/menus.vue` (메뉴 관리)**:
  - **역할**: 웹사이트 내비게이션 메뉴를 생성, 수정, 삭제, 재정렬하는 기능을 제공합니다.
  - **구현**: `vuedraggable` 라이브러리를 사용하여 메뉴를 드래그 앤 드롭으로 계층적으로 재정렬합니다. 메뉴 추가/수정을 위한 모달 폼을 제공하며, `parentId`와 `order` 필드를 사용하여 계층 구조 및 순서를 관리합니다.
  - **API 연동**: `/api/menus` 엔드포인트에 `GET`, `POST`, `PUT`, `DELETE`, `PATCH` 요청을 보내 메뉴 데이터를 조작합니다.
  - **피드백**: `useToast` 컴포저블을 사용하여 작업 결과를 사용자에게 알립니다.

- **`pages/adminpage/theme.vue` (테마 설정)**:
  - **역할**: 웹사이트의 헤더, 푸터, 배경 색상 등 테마 관련 설정을 라이트 모드와 다크 모드 각각에 대해 조정하고 저장합니다.
  - **구현**: 색상 입력 필드(`type="color"`)를 통해 사용자가 색상을 직접 선택하고 미리 볼 수 있도록 합니다.
  - **API 연동**: `/api/admin/theme-settings` 엔드포인트에 `GET` 요청으로 현재 설정을 불러오고, `PUT` 요청으로 변경 사항을 저장합니다.
  - **피드백**: `useToast` 컴포저블을 사용하여 설정 저장 성공/실패 메시지를 표시합니다.

- **`pages/adminpage/database.vue` (DB 관리)**:
  - **역할**: 데이터베이스의 각 모델에 대한 데이터를 조회하고 CRUD(생성, 읽기, 수정, 삭제) 작업을 수행하는 동적 인터페이스를 제공합니다.
  - **구현**: `/api/admin/db/models`에서 스키마 메타데이터를 동적으로 가져와 사이드바에 모델 목록을 표시하고, 선택된 모델의 필드 정보에 따라 데이터 테이블과 추가/편집 모달 폼을 동적으로 렌더링합니다.
  - **데이터 타입 처리**: String, Int, DateTime, Boolean, Json 등 다양한 Prisma 필드 타입을 지원하며, DateTime은 `datetime-local` 입력 필드로, Json은 `textarea`로 처리합니다.
  - **API 연동**: `/api/admin/db/[model]` 및 `/api/admin/db/[model]/[id]` 엔드포인트를 통해 선택된 모델의 데이터를 조회, 생성, 수정, 삭제합니다.
  - **헬퍼 함수**: `~/utils/dateFormatter.ts`의 `formatDateTime`과 같은 유틸리티 함수를 활용하여 데이터 형식을 처리합니다.

- **`pages/adminpage/users.vue` (사용자 관리)**:
  - **역할**: 관리자가 사용자 계정을 관리(조회, 생성, 수정, 삭제, 비밀번호 재설정, 활성/비활성 상태 변경)할 수 있는 포괄적인 인터페이스를 제공합니다.
  - **구현**: 사용자 목록을 테이블 형태로 표시하며, 검색(`debouncedSearch` 사용), 역할/상태 필터링, 컬럼 정렬 기능을 지원합니다. `UserCreateModal`, `UserEditModal`, `ResetPasswordModal`, `DeleteConfirmModal` 등 여러 모달 컴포넌트를 활용하여 각 작업을 수행합니다.
  - **API 연동**: `/api/admin/users` 및 관련 엔드포인트에 비동기 요청을 보내 사용자 데이터를 조작합니다.
  - **피드백**: `useToast` 컴포저블을 통해 작업 성공/실패 메시지를 표시합니다.
  - **UI/UX**: 사용자 역할(`ADMIN`, `USER`) 및 활성 상태(`isActive`)에 따라 시각적으로 구분되는 배지 스타일을 적용합니다.
  - **페이지네이션**: 서버로부터 받은 `pagination` 정보를 바탕으로 페이지 이동 및 현재 페이지 정보를 표시합니다.

- **`pages/adminpage/posts.vue` (게시판 관리)**:
  - **역할**: 웹사이트의 게시판 목록을 관리(추가, 수정, 삭제)하는 기능을 제공합니다.
  - **구현**: 현재 게시판 데이터가 프론트엔드(`boards` reactive state)에 하드코딩되어 있으며, 모달을 통해 게시판의 이름과 설명을 편집할 수 있습니다.
  - **API 연동**: **(현재 미구현)** 백엔드 API (`/api/boards` 등)와의 데이터 연동은 아직 이루어지지 않았습니다. 데이터는 프론트엔드에서만 관리됩니다.
  - **특징**: 다른 관리자 페이지(예: `users.vue`, `menus.vue`)와 달리, 이 페이지는 Prisma 또는 기타 백엔드 데이터베이스와의 연동 없이 클라이언트 측에서만 데이터를 관리한다는 점이 특징입니다.

## 플러그인 패턴 (Plugins 및 Plugin 기반)
Nuxt.js 플러그인은 Vue.js 애플리케이션의 초기화 단계에서 실행되어 전역적으로 기능을 확장하거나 외부 라이브러리를 통합하는 데 사용됩니다.

- **`plugin/pinia.js`**:
  - **역할**: 애플리케이션의 전역 상태 관리를 위한 Pinia 스토어를 초기화하고 Vue 애플리케이션에 연결합니다.
  - **구현**: `defineNuxtPlugin` 내에서 `createPinia()`를 호출하여 Pinia 인스턴스를 생성하고, `nuxtApp.vueApp.use(pinia)`를 통해 Vue 앱에 등록합니다.

- **`plugin/supabase.js`**:
  - **역할**: Supabase 클라이언트를 초기화하고 애플리케이션 전반에서 사용할 수 있도록 `provide`를 통해 노출합니다.
  - **구현**: `useRuntimeConfig()`를 통해 환경 변수(`supabaseUrl`, `supabaseKey`)를 가져와 `createClient` 함수로 Supabase 클라이언트를 생성합니다. 이후 `{ provide: { supabase } }` 형태로 반환하여 Nuxt App의 `$` 프리픽스를 통해 `app.$supabase`와 같이 접근 가능하게 합니다.

- **`plugins/v-html-img-one.js` (이미지 최적화 - 첫 번째 이미지)**:
  - **역할**: HTML 문자열 내에서 발견되는 **첫 번째** `<img>` 태그에 대한 지연 로딩 및 이미지 최적화 기능을 제공하는 커스텀 디렉티브 `v-html-img-one`을 등록합니다.
  - **구현**: `beforeMount` 훅에서 `DOMParser`를 사용하여 바인딩된 HTML 문자열을 파싱하고 첫 번째 `<img>` 태그를 찾습니다. 해당 이미지에 `loading="lazy"`, `format="webp"`, `data-src` 속성을 추가하고 `src`는 비워둡니다. `IntersectionObserver`를 사용하여 이미지가 뷰포트에 들어올 때 `data-src`의 URL을 `src`로 이동시켜 이미지를 로드합니다.

- **`plugins/v-html-img.js` (이미지 최적화 - 모든 이미지)**:
  - **역할**: HTML 문자열 내에서 발견되는 **모든** `<img>` 태그에 대한 지연 로딩 및 이미지 최적화 기능을 제공하는 커스텀 디렉티브 `v-html-img`를 등록합니다. `v-html-img-one.js`와 유사한 방식으로 작동하지만, 모든 이미지에 적용됩니다.
  - **구현**: `beforeMount` 훅에서 `DOMParser`를 사용하여 바인딩된 HTML 문자열을 파싱하고 모든 `<img>` 태그를 찾습니다. 각 이미지에 `loading="lazy"`, `format="webp"`, `data-src` 속성을 추가하고 `src`는 비워둡니다. `IntersectionObserver`를 사용하여 이미지가 뷰포트에 들어올 때 `data-src`의 URL을 `src`로 이동시켜 이미지를 로드합니다.

- **`plugins/v-lazy-load.js` (범용 지연 로딩)**:
  - **역할**: 요소가 뷰포트에 들어올 때 특정 컴포넌트나 콘텐츠를 지연 로드하는 범용적인 커스텀 디렉티브 `v-lazy-load`를 등록합니다.
  - **구현**: `beforeMount` 훅에서 `process.client`를 확인하여 클라이언트 사이드에서만 실행되도록 합니다. `IntersectionObserver`를 사용하여 엘리먼트가 뷰포트와 교차할 때 바인딩된 `binding.value` 함수(보통 컴포넌트 로딩 로직)를 실행하고, 더 이상 관찰하지 않도록 `unobserve` 합니다.

## 주의가 필요한 파일 (수정 시 영향 범위가 큰 파일)
- **`prisma/schema.prisma`**: 모든 데이터 모델의 원천 소스. 변경 시 관련된 모든 API와 UI에 영향을 미칩니다.
- **`nuxt.config.ts`**: 프로젝트의 빌드, 렌더링, 모듈 등 핵심 설정을 담고 있습니다.
- **`composables/useAuth.js`**: 전역 인증 상태를 관리하므로, 수정 시 모든 페이지의 인증 로직에 영향을 줄 수 있습니다.
- **`layouts/admin.vue`, `layouts/default.vue`**: 사이트의 기본 골격을 정의하는 파일입니다.

## 주요 파일 및 잠재적 사이드 이펙트
프로젝트의 특정 파일들은 수정 시 광범위한 사이드 이펙트를 유발할 수 있으므로 신중한 접근이 필요합니다.

1.  **데이터베이스 스키마 및 데이터 (`prisma/`, `seed.js`)**
    *   **`prisma/schema.prisma`**: 데이터 모델의 구조를 정의하며, 변경 시 관련된 모든 API와 프론트엔드 컴포넌트에 연쇄적인 영향을 미칩니다.
    *   **`seed.js`**: 초기 데이터를 생성하며, 잘못 수정하면 데이터 중복 및 오류를 유발할 수 있습니다.

2.  **전역 설정 및 중앙 관리 (`nuxt.config.ts`, `server/utils/prisma.js`)**
    *   **`nuxt.config.ts`**: 프로젝트의 핵심 설정 파일로, 작은 변경만으로도 빌드 실패나 렌더링 오류 등 전반적인 문제를 일으킬 수 있습니다.
    *   **`server/utils/prisma.js`**: Prisma 클라이언트를 중앙 관리하므로, 수정 시 모든 데이터베이스 접근 API의 동작에 영향을 줍니다.

3.  **데이터 변경 API (`server/api/**/*.js`)**
    *   `POST`, `PUT`, `PATCH`, `DELETE` 요청을 처리하는 API들은 데이터베이스 상태를 직접 변경하므로, 수정 시 데이터 무결성에 큰 영향을 미칩니다.

4.  **공유 상태 및 전역 로직 (`stores/`, `plugins/`)**
    *   **`stores/**/*.js`**: 여러 컴포넌트가 공유하는 상태를 관리하므로, 수정 시 관련된 모든 컴포넌트의 동작이 예상치 않게 변경될 수 있습니다.
    *   **`plugins/**/*.js`**: 앱 초기화 시 실행되는 전역 로직으로, 수정 시 앱 전체의 동작에 영향을 미칠 수 있습니다.

## 주요 기술 결정
1. 텍스트 에디터
   - Quill Editor 선택 이유
     * 풍부한 기능 지원
     * 커스터마이징 용이
     * 안정적인 성능
     * 마크다운 지원

2. 데이터베이스
   - Prisma ORM 선택 이유
     * 타입 안정성
     * 쉬운 마이그레이션
     * 효율적인 쿼리
     * 스키마 관리 용이

3. **게시판 답변 기능 구현 방식**
   - **데이터 구조**: `BoardPost` 모델 내에 `parentId` 필드를 추가하여 자기 참조(self-relation)를 통해 계층적 데이터 구조(원본 글-답변 글)를 구현.
   - **API 로직**:
     - 원본 글(`parentId`가 null)만 페이지네이션하여 조회 효율을 확보.
     - 조회된 원본 글 목록에 해당하는 답변 글들을 한 번의 추가 쿼리로 가져와 N+1 문제 방지.
     - 서버에서 원본 글과 답변 글을 조합하여 클라이언트에 전달함으로써 프론트엔드 부담 최소화.
     - 답변 글의 제목은 서버에서 동적으로 생성하여 데이터 일관성 유지.

## API 문서
- API 관련 문서는 `memory-bank/api-docs/` 디렉토리에 저장되어 있습니다.
- 각 파일은 API 엔드포인트, 요청/응답 형식, 그리고 사용 예제를 포함합니다.
- **관리자 기능 - 사용자 관리**:
  - 페이지네이션, 검색, 정렬, 필터링을 포함한 사용자 목록 조회 기능이 정상 작동합니다.
  - 사용자 추가, 수정, 삭제, 비밀번호 재설정, 계정 활성/비활성화 기능이 모달을 통해 정상적으로 작동합니다.
  - 모든 작업에 대한 피드백이 토스트 메시지로 제공됩니다.

## 인증 및 권한 관리

### `useAuth` Composable

- **위치**: `composables/useAuth.js`
- **역할**: 전역 인증 상태(로그인 여부, 사용자 정보)를 관리하고 관련 유틸리티 함수를 제공합니다.
- **구조**:
  - `useState`를 사용하여 전역 상태(`authState`)를 생성합니다.
  - `computed` 속성을 통해 반응형 상태 값을 외부로 노출합니다.
    - `isLoggedIn`: 사용자의 로그인 상태 (boolean)
    - `user`: 로그인된 사용자 정보 (object | null)
    - `isAdmin`: 사용자의 관리자 권한 여부 (boolean)
  - `setAuth(isLoggedIn, user)`: 인증 상태를 명시적으로 설정합니다.
  - `checkAuth()`: `/api/user?type=check` API를 호출하여 현재 세션의 유효성을 확인하고 상태를 갱신합니다. 서버에서 데이터를 가져와 로그인 여부와 사용자 정보를 업데이트합니다.

- **사용법**:
  ```javascript
  // script setup 내부
  import { useAuth } from '~/composables/useAuth';

  const { isLoggedIn, user, isAdmin, setAuth } = useAuth();
  
  // 템플릿에서는 ref의 .value 없이 바로 사용 가능
  // <p v-if="isLoggedIn">환영합니다, {{ user.username }}님!</p>
  
  // 스크립트 로직에서는 .value로 접근해야 함
  if (isAdmin.value) {
    console.log('관리자입니다.');
  }
  ```
- **리팩터링 이력**:
  - 초기에는 `useState`가 반환하는 `auth` ref를 포함한 객체 `{ auth, setAuth, ... }`를 반환했습니다.
  - 이 구조는 컴포넌트에서 `auth.auth.value.isLoggedIn`과 같이 복잡하게 접근해야 하는 불편함이 있었습니다.
  - `computed` 속성을 도입하여 `isLoggedIn`, `user`, `isAdmin`을 직접 반환하도록 개선하여, 컴포넌트에서 상태 값에 더 직관적으로 접근할 수 있게 되었습니다. 

## 전역 유틸리티 및 데이터 프로비저닝 (Composables 기반)

### 토스트 알림 시스템 (`composables/useToast.js`)
- **패턴 설명**: 애플리케이션 전반에 걸쳐 일시적인 사용자 피드백(성공, 오류, 경고, 정보 메시지)을 제공하는 전역 토스트 알림 시스템입니다. 이전 토스트를 자동으로 제거하고 새로운 토스트만 표시하여 UI 혼란을 방지합니다.
- **구현**: `showToast(message, type, duration)` 함수를 통해 메시지, 유형, 표시 시간을 설정하여 토스트를 표시합니다. `removeToast(id)`로 특정 토스트를 수동으로 제거할 수 있습니다.

### 모달 시스템 (`composables/useModal.js`, `composables/useReplyModal.js`, `composables/useLoginModal.js`, `composables/useRegisterModal.js`)
- **패턴 설명**: 범용적인 확인/알림 모달부터 특정 목적(댓글, 로그인, 회원가입)을 위한 모달까지, 다양한 모달 UI를 중앙에서 관리하고 제어하는 시스템입니다. 모달의 `isOpen` 상태, 제목, 내용, 확인 여부 및 콜백 함수를 통해 유연하게 모달 동작을 정의합니다.
- **구현**:
  - `useModal.js`: 가장 일반적인 모달 컴포저블로, `openModal(title, content, callback, confirm)`을 통해 다양한 유형의 모달을 생성합니다.
  - `useReplyModal.js`, `useLoginModal.js`, `useRegisterModal.js`: 특정 기능을 위해 디자인된 모달 컴포저블로, 해당 모달의 `isOpen` 상태와 관련 로직(예: `useReplyModal`의 `replyCallback`)을 관리합니다.

### 데이터 프로비저닝 컴포저블 (`composables/useImages.js`, `composables/usePosts.js`)
- **패턴 설명**: 주로 `/server/data` 디렉토리의 정적 데이터(예: 캐러셀 이미지, 블로그/게시판 포스트)를 프론트엔드 컴포넌트에서 쉽게 소비할 수 있도록 캡슐화하는 컴포저블입니다. 데이터를 `ref`로 래핑하여 반응성을 유지합니다.
- **구현**:
  - `useImages.js`: `getCarouselImages()` 함수를 통해 캐러셀에 사용될 이미지 데이터를 제공합니다.
  - `usePosts.js`: `getBlogPosts()` 및 `getBoardPosts()` 함수를 통해 블로그 및 게시판 포스트 데이터를 제공합니다.

## What's Left to Build

- **게시판 및 갤러리**:
  - 파일 업로드 및 관리 기능 구현이 필요합니다.
- **관리자 기능**:
  - 게시글 관리 기능 구현이 필요합니다.

## Known Issues

- 현재 알려진 주요 이슈는 없습니다.

## Blockers

- 현재 알려진 주요 블로커는 없습니다.

## 컴포넌트 패턴
- **모달 기반 CRUD**: `pages/adminpage/users.vue`와 같이 복잡한 CRUD(생성, 읽기, 수정, 삭제) 인터페이스를 구현할 때, 주 화면은 데이터 목록(테이블)을 표시하고 각 작업(생성, 수정, 삭제 확인 등)은 별도의 모달 컴포넌트(`components/admin/*.vue`)를 통해 처리합니다. 이 패턴은 UI를 깔끔하게 유지하고 각 기능의 관심사를 분리하는 데 효과적입니다.
- **공용 피드백 컴포넌트**: `components/common/Toast.vue`와 같이 애플리케이션 전반에서 사용될 수 있는 피드백 컴포넌트를 만들어 사용자 경험의 일관성을 높입니다. 이벤트 발생 시 페이지 레벨에서 토스트의 상태를 관리하여 메시지를 표시합니다.
- **명시적 컴포넌트 Import**: Nuxt의 컴포넌트 자동 임포트(`auto-import`) 기능이 예상대로 동작하지 않을 경우, `[Vue warn]: Failed to resolve component`와 같은 경고가 발생할 수 있습니다. 이 경우, 해당 컴포넌트를 사용하는 부모 컴포넌트의 `<script setup>` 블록 내에서 `import ComponentName from '~/components/path/to/ComponentName.vue'`와 같이 명시적으로 컴포넌트를 import하여 문제를 해결합니다.

### 6. 아웃라이너 항목 구조 (vuedraggable)
- **패턴 설명**: `vuedraggable` 컴포넌트 사용 시 `Item slot must have only one child` 오류를 방지하기 위해, 드래그 가능한 각 아이템의 슬롯(`template #item`) 내부가 항상 **단 하나의 최상위(root) HTML 요소**로 감싸여 있도록 명시적으로 구조화합니다.
- **구현**:
  - `pages/outliner.vue`의 메인 `draggable` 컴포넌트에서 `OutlineItem`을 `div`로 감쌌습니다.
  - `components/OutlineItem.vue` 내부의 중첩된 `draggable` 컴포넌트에서도 `OutlineItem`을 `div`로 감싸는 재귀적인 방식으로 이 패턴을 적용합니다. 이는 `vuedraggable`이 재귀적 구조에서 각 슬롯 항목을 올바르게 인식하도록 보장합니다.

### 5. Quill 에디터 이미지 처리 커스터마이징
- **패턴 설명**: 표준 이미지 업로드 기능을 사용하는 대신, 이미지를 Base64 문자열로 변환하여 에디터 콘텐츠에 직접 삽입하는 방식을 사용합니다. 또한, 클라이언트 사이드에서 이미지 크기 조절, 삭제, 교체 기능을 제공하여 사용자 경험을 향상시킵니다.
- **구현**:
  - **Base64 변환 및 다중 이미지 삽입**:
    - Quill 에디터의 `image` 핸들러를 오버라이드합니다.
    - 사용자가 파일을 선택하면 `FileReader`를 사용하여 각 이미지 파일을 읽고 Base64로 인코딩합니다.
    - 변환된 Base64 문자열을 `<img>` 태그의 `src` 속성으로 사용하여 에디터의 현재 커서 위치에 순차적으로 삽입합니다.
  - **이미지 리사이즈, 삭제, 교체**:
    - `quill-resize-module` 라이브러리를 동적 `import`를 통해 클라이언트 사이드에서만 로드하여 SSR(Server-Side Rendering) 오류를 방지합니다.
    - 모듈 등록 시 `replace` 옵션을 활성화하고, 커스텀 `handleReplace` 함수를 구현하여 이미지 교체 로직을 처리합니다.
    - 이 모듈은 사용자가 에디터 내의 이미지를 클릭했을 때 리사이즈 핸들, 삭제 버튼, 교체 버튼을 UI로 제공합니다.
  - **SSR 호환성 확보**:
    - `onMounted` 훅 내부에서 `quill-resize-module`을 `await import(...)` 구문을 사용하여 동적으로 가져옵니다.
    - `Quill.register`를 호출하기 전에 `window` 객체의 존재 여부를 확인하여 서버 사이드 렌더링 시 관련 코드가 실행되지 않도록 방지합니다.
- **장점**:
  - 별도의 이미지 저장/관리 서버가 필요 없어 아키텍처가 단순해집니다.
  - 모든 콘텐츠(텍스트+이미지)가 단일 데이터 필드에 저장되어 관리가 용이합니다.
- **단점**:
  - Base64 인코딩으로 인해 데이터의 크기가 약 33% 증가하여 DB 저장 공간 비효율 및 네트워크 부하를 유발할 수 있습니다. (향후 이미지 압축 또는 서버 업로드 방식으로 전환 고려 필요) 

## 스타일링 패턴 (Assets/CSS 기반)
- **`assets/css/main.css`**: Tailwind CSS의 `@tailwind` 지시문을 포함하며, 전역 `html`, `body` 스타일(min-height, 다크 모드 배경색 등) 및 메뉴 오픈 시 `pointer-events` 제어와 같은 핵심 전역 스타일을 정의합니다. `img` 태그에 `content-visibility: auto`를 적용하여 성능을 최적화합니다.
- **`assets/css/calendar.css`**: FullCalendar 라이브러리의 UI를 프로젝트 테마에 맞게 커스터마이징합니다. 버튼, 이벤트, 오늘 날짜 및 요일(`fc-day-today`, `fc-day-sun`, `fc-day-sat`)에 대한 스타일을 정의하며, 특히 다크 모드 환경에 대한 포괄적인 스타일(`dark` 클래스 사용)을 포함하여 일관된 시각적 경험을 제공합니다. 공휴일(`fc-day-holiday`) 스타일도 정의합니다.
- **`assets/css/quill-custom.css`**: Quill Editor의 기본 스타일을 오버라이드하고 확장합니다. 에디터 본문(`ql-editor`), 툴바(`ql-toolbar`), 컨테이너(`ql-container`)의 색상, 테두리, 아이콘(`ql-stroke`, `ql-fill`)에 대한 라이트/다크 모드 스타일을 정의합니다. 또한, 삽입된 비디오(`ql-video`)의 반응형 너비 및 비율을 설정하여 다양한 화면 크기에서 적절히 표시되도록 합니다. 

## 페이지 패턴 (Pages 기반)
애플리케이션의 각 페이지는 특정 기능을 제공하며, Nuxt.js의 페이지 기반 라우팅 시스템을 활용합니다. 다양한 데이터 로딩 전략과 UI 상호작용 패턴이 적용됩니다.

- **`pages/index.vue` (메인 페이지)**:
  - **역할**: 사용자가 다양한 콘텐츠 섹션(슬라이드, 게시판, 갤러리, 일기예보, 달력)을 동적으로 선택하고 볼 수 있는 메인 대시보드 역할을 합니다.
  - **구조**: 섹션 선택을 위한 체크박스 UI와 선택된 섹션에 따라 비동기적으로 해당 컴포넌트를 로드하는 `Suspense` 및 `defineAsyncComponent`를 사용합니다.
  - **상태 관리**: 선택된 섹션 목록을 로컬 스토리지에 저장하고 `watch`를 통해 변경 사항을 반영하여 사용자 선호도를 유지합니다.
  - **Pinia 연동**: `useGalleryStore`와 연동하여 갤러리 모달을 관리합니다.
  - **SEO**: `definePageMeta`를 사용하여 페이지 제목과 메타 설명을 설정합니다.

- **`pages/personal-info.vue` (개인정보 페이지)**:
  - **역할**: 로그인된 사용자의 개인 정보(이름, 이메일)를 표시하고, 이메일 및 비밀번호를 수정할 수 있는 기능을 제공합니다. 이름은 수정 불가능합니다.
  - **구현**: `isEditing` 반응형 상태를 사용하여 조회 모드와 편집 모드를 전환하는 UI 패턴을 구현합니다.
  - **데이터 관리**: `useFetch('/api/user?type=check')`를 사용하여 초기 사용자 정보를 가져오고, `useFetch('/api/user?type=update', { method: 'POST', body: ... })`를 통해 사용자 정보를 업데이트합니다. 비밀번호와 비밀번호 확인 필드의 클라이언트 측 유효성 검사를 수행합니다.
  - **UI/UX**: 이름 입력 필드는 `disabled` 속성과 Tailwind CSS의 `disabled:bg-gray-200 disabled:dark:bg-gray-900 cursor-not-allowed` 클래스를 적용하여 수정 불가를 시각적으로 명확히 합니다.
  - **라우팅/인증**: 로그인되지 않은 사용자는 `/login` 페이지로 리다이렉트됩니다.

### 관리자 페이지 패턴 (`pages/adminpage` 하위)
관리자 페이지는 `admin` 레이아웃과 `admin-auth` 미들웨어를 공통적으로 사용하며, 각 페이지는 특정 관리 기능을 담당합니다.

- **`pages/adminpage/index.vue` (관리자 대시보드)**:
  - **역할**: 관리자 섹션의 진입점으로, 간단한 대시보드 메시지를 표시합니다.
  - **구성**: `admin` 레이아웃과 `admin-auth` 미들웨어를 적용합니다.

- **`pages/adminpage/menus.vue` (메뉴 관리)**:
  - **역할**: 웹사이트 내비게이션 메뉴를 생성, 수정, 삭제, 재정렬하는 기능을 제공합니다.
  - **구현**: `vuedraggable` 라이브러리를 사용하여 메뉴를 드래그 앤 드롭으로 계층적으로 재정렬합니다. 메뉴 추가/수정을 위한 모달 폼을 제공하며, `parentId`와 `order` 필드를 사용하여 계층 구조 및 순서를 관리합니다.
  - **API 연동**: `/api/menus` 엔드포인트에 `GET`, `POST`, `PUT`, `DELETE`, `PATCH` 요청을 보내 메뉴 데이터를 조작합니다.
  - **피드백**: `useToast` 컴포저블을 사용하여 작업 결과를 사용자에게 알립니다.

- **`pages/adminpage/theme.vue` (테마 설정)**:
  - **역할**: 웹사이트의 헤더, 푸터, 배경 색상 등 테마 관련 설정을 라이트 모드와 다크 모드 각각에 대해 조정하고 저장합니다.
  - **구현**: 색상 입력 필드(`type="color"`)를 통해 사용자가 색상을 직접 선택하고 미리 볼 수 있도록 합니다.
  - **API 연동**: `/api/admin/theme-settings` 엔드포인트에 `GET` 요청으로 현재 설정을 불러오고, `PUT` 요청으로 변경 사항을 저장합니다.
  - **피드백**: `useToast` 컴포저블을 사용하여 설정 저장 성공/실패 메시지를 표시합니다.

- **`pages/adminpage/database.vue` (DB 관리)**:
  - **역할**: 데이터베이스의 각 모델에 대한 데이터를 조회하고 CRUD(생성, 읽기, 수정, 삭제) 작업을 수행하는 동적 인터페이스를 제공합니다.
  - **구현**: `/api/admin/db/models`에서 스키마 메타데이터를 동적으로 가져와 사이드바에 모델 목록을 표시하고, 선택된 모델의 필드 정보에 따라 데이터 테이블과 추가/편집 모달 폼을 동적으로 렌더링합니다.
  - **데이터 타입 처리**: String, Int, DateTime, Boolean, Json 등 다양한 Prisma 필드 타입을 지원하며, DateTime은 `datetime-local` 입력 필드로, Json은 `textarea`로 처리합니다.
  - **API 연동**: `/api/admin/db/[model]` 및 `/api/admin/db/[model]/[id]` 엔드포인트를 통해 선택된 모델의 데이터를 조회, 생성, 수정, 삭제합니다.
  - **헬퍼 함수**: `~/utils/dateFormatter.ts`의 `formatDateTime`과 같은 유틸리티 함수를 활용하여 데이터 형식을 처리합니다.

- **`pages/adminpage/users.vue` (사용자 관리)**:
  - **역할**: 관리자가 사용자 계정을 관리(조회, 생성, 수정, 삭제, 비밀번호 재설정, 활성/비활성 상태 변경)할 수 있는 포괄적인 인터페이스를 제공합니다.
  - **구현**: 사용자 목록을 테이블 형태로 표시하며, 검색(`debouncedSearch` 사용), 역할/상태 필터링, 컬럼 정렬 기능을 지원합니다. `UserCreateModal`, `UserEditModal`, `ResetPasswordModal`, `DeleteConfirmModal` 등 여러 모달 컴포넌트를 활용하여 각 작업을 수행합니다.
  - **API 연동**: `/api/admin/users` 및 관련 엔드포인트에 비동기 요청을 보내 사용자 데이터를 조작합니다.
  - **피드백**: `useToast` 컴포저블을 통해 작업 성공/실패 메시지를 표시합니다.
  - **UI/UX**: 사용자 역할(`ADMIN`, `USER`) 및 활성 상태(`isActive`)에 따라 시각적으로 구분되는 배지 스타일을 적용합니다.
  - **페이지네이션**: 서버로부터 받은 `pagination` 정보를 바탕으로 페이지 이동 및 현재 페이지 정보를 표시합니다.

- **`pages/adminpage/posts.vue` (게시판 관리)**:
  - **역할**: 웹사이트의 게시판 목록을 관리(추가, 수정, 삭제)하는 기능을 제공합니다.
  - **구현**: 현재 게시판 데이터가 프론트엔드(`boards` reactive state)에 하드코딩되어 있으며, 모달을 통해 게시판의 이름과 설명을 편집할 수 있습니다.
  - **API 연동**: **(현재 미구현)** 백엔드 API (`/api/boards` 등)와의 데이터 연동은 아직 이루어지지 않았습니다. 데이터는 프론트엔드에서만 관리됩니다.
  - **특징**: 다른 관리자 페이지(예: `users.vue`, `menus.vue`)와 달리, 이 페이지는 Prisma 또는 기타 백엔드 데이터베이스와의 연동 없이 클라이언트 측에서만 데이터를 관리한다는 점이 특징입니다.

## 테마 설정 모델 (`SiteConfig`)
- **패턴 설명**: 웹사이트의 라이트/다크 모드별 헤더, 푸터, 배경색을 포함한 테마 설정을 저장하는 단일 `SiteConfig` 모델을 사용합니다. 이는 전역 UI 테마 설정을 중앙에서 관리하고 동적으로 불러오는 패턴을 가능하게 합니다. 

## 정적 자산 관리 (Public 기반)
애플리케이션의 정적 자산은 `public/` 디렉토리 아래에 관리되며, 효율적인 로딩과 테마 일관성을 고려하여 사용됩니다.

- **`public/favicon.ico`**: 웹사이트의 파비콘 아이콘입니다.
- **`public/icons/`**: 애플리케이션의 로고 및 기타 UI 아이콘을 포함합니다. 예: `channels4_profile.jpg`, `logo260260-nobg.png`.
- **`public/images/`**: 주요 이미지 자산이 저장되는 곳입니다.
  - **`public/images/background/`**: 배경 이미지(`eveningspa.webp`, `sunspa.webp`)를 포함하며, 웹P(`webp`) 포맷을 사용하여 이미지 로딩 성능을 최적화합니다.
  - **`public/images/foods/`**: AI로 생성된 것으로 보이는 다양한 음식 관련 `.webp` 이미지 파일들을 포함합니다. 이 이미지들은 긴 파일 이름을 가지며, 주로 콘텐츠 표시를 위한 정적 리소스로 사용됩니다.
  - **`public/images/home-repair.jpg`**: 단일 대용량 이미지 파일로, 특정 페이지나 컴포넌트에서 배경 또는 주요 시각 요소로 사용될 수 있습니다.

### 사용자 인증 및 관리 API 패턴 (`server/api/user.js`)
이 파일은 사용자 로그인, 로그아웃, 인증 상태 확인, 회원가입, 사용자 정보 업데이트 기능을 담당하는 핵심 API 엔드포인트를 제공합니다.

- **`type=login` (POST)**: 사용자 이름과 비밀번호를 받아 인증하고 JWT 토큰을 발급하여 쿠키에 저장합니다. 실패 시 401 오류를 반환합니다.
- **`type=logout` (GET)**: 쿠키에서 JWT 토큰을 제거하여 로그아웃 처리합니다.
- **`type=check` (GET)**: 쿠키의 JWT 토큰을 검증하여 현재 사용자의 로그인 상태와 정보를 반환합니다. 토큰이 없거나 유효하지 않으면 `isLoggedIn: false`를 반환합니다.
- **`type=register` (POST)**: 새로운 사용자를 등록합니다. 사용자 이름과 이메일의 중복을 확인하고, 비밀번호를 해싱하여 저장합니다. 성공 시 JWT 토큰을 발급하고 쿠키에 저장합니다.
- **`type=update` (POST)**: 로그인된 사용자의 이메일 또는 비밀번호를 업데이트합니다. 사용자 이름은 수정할 수 없습니다. JWT를 통해 사용자 인증 후 업데이트를 진행합니다.
- **보안**: `bcrypt`를 사용하여 비밀번호를 안전하게 해싱하고, `jose` 라이브러리를 통해 JWT 토큰을 생성 및 검증합니다.
- **데이터베이스 연동**: `prisma`를 통해 `User` 모델과 상호작용하여 사용자 정보를 조회, 생성, 업데이트합니다.

### 사용자 이름 중복 확인 API 패턴 (`server/api/user/check-username.get.js`)
이 파일은 회원가입 시 사용자 이름의 중복 여부를 실시간으로 확인하는 API 엔드포인트입니다.

- **엔드포인트**: `GET /api/user/check-username`
- **쿼리 파라미터**: `username` (확인할 사용자 이름)
- **동작**: 요청된 `username`이 데이터베이스에 이미 존재하는지 확인합니다.
- **응답**: `available: true` (사용 가능) 또는 `available: false` (사용 중) 및 해당 메시지를 반환합니다.
- **오류 처리**: `username`이 제공되지 않거나 서버 오류 발생 시 적절한 HTTP 상태 코드(400 또는 500)와 메시지를 반환합니다.

### 관리자 테마 설정 조회 API 패턴 (`server/api/admin/theme-settings.get.js`)
이 파일은 웹사이트의 테마 관련 설정(헤더, 푸터, 배경색 등)을 조회하는 관리자 API 엔드포인트입니다. 설정이 존재하지 않을 경우 기본값을 생성하여 반환합니다.

- **엔드포인트**: `GET /api/admin/theme-settings`
- **데이터 모델**: `Prisma.siteConfig` 모델을 사용합니다.
- **동작**: 데이터베이스에서 `siteConfig`를 찾아 반환합니다. 만약 `siteConfig` 레코드가 없을 경우, 미리 정의된 기본 색상 값으로 새로운 레코드를 생성한 후 반환합니다.
- **오류 처리**: 데이터베이스 조회 또는 생성 중 오류 발생 시 500 Internal Server Error를 반환합니다.

### 관리자 테마 설정 업데이트 API 패턴 (`server/api/admin/theme-settings.put.js`)
이 파일은 웹사이트의 테마 관련 설정을 업데이트하는 관리자 API 엔드포인트입니다. 제공된 색상 데이터가 없을 경우 오류를 반환하고, 기존 설정이 없을 경우 기본값으로 새로 생성하거나 기존 설정을 업데이트합니다.

- **엔드포인트**: `PUT /api/admin/theme-settings`
- **요청 본문**: `lightHeaderColor`, `darkHeaderColor`, `lightFooterColor`, `darkFooterColor`, `lightBackgroundColor`, `darkBackgroundColor` 필드를 포함합니다.
- **데이터 모델**: `Prisma.siteConfig` 모델을 사용합니다.
- **동작**: 요청 본문으로 받은 색상 값으로 `siteConfig` 레코드를 업데이트합니다. 특정 색상 값이 제공되지 않으면 기존 값을 유지합니다. `siteConfig` 레코드가 없을 경우, 제공된 값 또는 기본값으로 새로운 레코드를 생성합니다.
- **오류 처리**: 요청 본문에 색상 데이터가 없거나 서버 오류 발생 시 400 Bad Request 또는 500 Internal Server Error를 반환합니다.

### 관리자 데이터베이스 모델 목록 조회 API 패턴 (`server/api/admin/db/models.get.js`)
이 파일은 Prisma DMMF(Data Model Meta Format)를 사용하여 데이터베이스의 모든 모델에 대한 메타데이터(이름, 필드, 타입 등)를 제공하는 관리자 API 엔드포인트입니다.

- **엔드포인트**: `GET /api/admin/db/models`
- **동작**: `Prisma.dmmf.datamodel.models`에서 각 모델의 `name`, `fields` (각 필드의 `name`, `type`, `isId`, `isRequired`, `isUnique`, `kind`) 정보를 추출하여 반환합니다.
- **활용**: 프론트엔드에서 데이터베이스 스키마를 동적으로 구성하고 UI를 생성하는 데 사용됩니다.

### 관리자 데이터베이스 모델 항목 조회 API 패턴 (`server/api/admin/db/[model]/index.get.js`)
이 파일은 동적으로 지정된 모델에 대한 모든 레코드를 조회하는 관리자 API 엔드포인트입니다.

- **엔드포인트**: `GET /api/admin/db/[model]` (여기서 `[model]`은 데이터베이스 모델 이름입니다. 예: `User`, `BoardPost`)
- **동작**: 요청된 모델 이름이 유효한지 확인한 후, 해당 모델의 모든 레코드를 데이터베이스에서 `findMany()`를 통해 조회하여 반환합니다.
- **오류 처리**: 유효하지 않은 모델 이름이 제공되거나 데이터베이스 조회 중 오류 발생 시 400 Bad Request 또는 500 Internal Server Error를 반환합니다.

### 관리자 데이터베이스 모델 항목 생성 API 패턴 (`server/api/admin/db/[model]/index.post.js`)
이 파일은 동적으로 지정된 모델에 새로운 항목을 생성하는 관리자 API 엔드포인트입니다.

- **엔드포인트**: `POST /api/admin/db/[model]`
- **요청 본문**: 생성할 항목의 데이터 필드를 포함합니다. `BigInt` 타입 필드는 문자열로 받아 `BigInt` 타입으로 변환됩니다.
- **동작**: 요청된 모델 이름이 유효한지 확인하고, 제공된 데이터를 사용하여 해당 모델의 새 레코드를 생성합니다.
- **데이터 변환**: Prisma DMMF 정보를 활용하여 `BigInt` 필드에 대한 문자열-BigInt 변환을 자동으로 처리합니다.
- **오류 처리**: 유효하지 않은 모델 이름, 잘못된 `BigInt` 값, 또는 데이터베이스 생성 중 오류 발생 시 400 Bad Request 또는 500 Internal Server Error를 반환합니다.

### 관리자 데이터베이스 모델 항목 단일 조회 API 패턴 (`server/api/admin/db/[model]/[id].get.js`)
이 파일은 동적으로 지정된 모델에서 특정 ID를 가진 단일 항목을 조회하는 관리자 API 엔드포인트입니다.

- **엔드포인트**: `GET /api/admin/db/[model]/[id]` (여기서 `[model]`은 모델 이름, `[id]`는 항목의 ID입니다.)
- **동작**: 요청된 모델 이름과 ID가 유효한지 확인하고, 해당 모델의 기본 키(`idField`)를 통해 단일 레코드를 조회합니다. `Int` 및 `BigInt` 타입의 ID를 올바르게 파싱합니다.
- **오류 처리**: 유효하지 않은 모델 이름 또는 ID, 모델에 기본 키가 없는 경우, 레코드를 찾을 수 없는 경우, 또는 데이터베이스 조회 중 오류 발생 시 400, 404, 500 오류를 반환합니다.

### 관리자 데이터베이스 모델 항목 업데이트 API 패턴 (`server/api/admin/db/[model]/[id].put.js`)
이 파일은 동적으로 지정된 모델에서 특정 ID를 가진 항목을 업데이트하는 관리자 API 엔드포인트입니다.

- **엔드포인트**: `PUT /api/admin/db/[model]/[id]`
- **요청 본문**: 업데이트할 항목의 데이터 필드를 포함합니다. `BigInt` 필드는 문자열로 받아 `BigInt`로 변환됩니다.
- **동작**: 요청된 모델 이름과 ID가 유효한지 확인하고, 제공된 데이터를 사용하여 해당 모델의 레코드를 업데이트합니다. ID 필드의 타입(Int/BigInt)에 따라 적절히 파싱합니다.
- **데이터 변환**: Prisma DMMF 정보를 활용하여 `BigInt` 필드에 대한 문자열-BigInt 변환을 자동으로 처리합니다.
- **오류 처리**: 유효하지 않은 모델 이름 또는 ID, 잘못된 `BigInt` 값, 레코드를 찾을 수 없는 경우, 또는 데이터베이스 업데이트 중 오류 발생 시 400, 404, 500 오류를 반환합니다.

### 관리자 데이터베이스 모델 항목 삭제 API 패턴 (`server/api/admin/db/[model]/[id].delete.js`)
이 파일은 동적으로 지정된 모델에서 특정 ID를 가진 항목을 삭제하는 관리자 API 엔드포인트입니다.

- **엔드포인트**: `DELETE /api/admin/db/[model]/[id]`
- **동작**: 요청된 모델 이름과 ID가 유효한지 확인하고, 해당 모델의 기본 키(`idField`)를 통해 단일 레코드를 삭제합니다. `Int` 및 `BigInt` 타입의 ID를 올바르게 파싱합니다.
- **오류 처리**: 유효하지 않은 모델 이름 또는 ID, 모델에 기본 키가 없는 경우, 레코드를 찾을 수 없는 경우, 또는 데이터베이스 삭제 중 오류 발생 시 400, 404, 500 오류를 반환합니다.

### 관리자 사용자 삭제 API 패턴 (`server/api/admin/users/[id].delete.js`)
이 파일은 관리자 권한을 가진 사용자가 특정 사용자 ID를 통해 다른 사용자를 삭제할 수 있는 API 엔드포인트입니다.

- **엔드포인트**: `DELETE /api/admin/users/[id]`
- **인증**: JWT 토큰을 통해 관리자 권한(`ADMIN` 역할)을 확인합니다.
- **동작**: 사용자 ID를 파싱하고, 대상 사용자가 존재하는지 확인합니다. 요청을 보낸 관리자 본인은 삭제할 수 없도록 방지합니다. 이후 해당 사용자 레코드를 삭제합니다.
- **오류 처리**: 인증 실패(401), 권한 부족(403), 유효하지 않은 사용자 ID(400), 사용자를 찾을 수 없는 경우(404), 자기 자신을 삭제 시도(400), 또는 데이터베이스 삭제 중 오류(500) 발생 시 적절한 오류를 반환합니다.

### 관리자 사용자 업데이트 API 패턴 (`server/api/admin/users/[id].put.js`)
이 파일은 관리자 권한을 가진 사용자가 특정 사용자 ID를 통해 다른 사용자의 정보를 업데이트할 수 있는 API 엔드포인트입니다.

- **엔드포인트**: `PUT /api/admin/users/[id]`
- **요청 본문**: `username`, `email` (필수), `password`, `role`, `isActive` 필드를 포함합니다.
- **인증**: JWT 토큰을 통해 관리자 권한(`ADMIN` 역할)을 확인합니다.
- **동작**: 사용자 ID를 파싱하고, 대상 사용자가 존재하는지 확인합니다. 업데이트할 사용자명과 이메일의 중복을 현재 사용자를 제외하고 확인합니다. 비밀번호가 제공된 경우 bcrypt로 해싱하여 업데이트 데이터에 포함합니다. 이후 해당 사용자 레코드를 업데이트합니다.
- **오류 처리**: 인증 실패(401), 권한 부족(403), 유효하지 않은 사용자 ID(400), 필수 필드 누락(400), 유효하지 않은 역할(400), 사용자를 찾을 수 없는 경우(404), 중복 사용자명/이메일(409), 또는 데이터베이스 업데이트 중 오류(500) 발생 시 적절한 오류를 반환합니다.

### 블로그 게시물 API 패턴 (`server/api/blogPosts/`)
이 디렉토리는 현재 비어 있으며, 블로그 게시물과 관련된 API 엔드포인트를 구현할 예정입니다.

### 관리자 페이지 패턴 (`pages/adminpage` 하위)
관리자 페이지는 `admin` 레이아웃과 `admin-auth` 미들웨어를 공통적으로 사용하며, 각 페이지는 특정 관리 기능을 담당합니다.

// ... existing code ...