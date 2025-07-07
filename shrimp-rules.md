# 개발 가이드라인

## 프로젝트 개요

### 기술 스택
- Nuxt.js 3
- Vue 3
- Pinia (상태 관리)
- Tailwind CSS (UI)
- Prisma (ORM)
- Supabase (백엔드 서비스)
- Quill Editor (텍스트 에디터)
- FullCalendar (캘린더)

## 프로젝트 아키텍처

### 디렉토리 구조 및 역할
- `components/`: 재사용 가능한 UI 컴포넌트를 기능별 하위 디렉토리(예: `admin/`, `youtubeGallery/`, `common/`)로 분류하여 관리합니다.
- `pages/`: Nuxt.js의 파일 기반 라우팅 시스템에 따라 각 페이지를 구성합니다.
- `server/api/`: 백엔드 API 엔드포인트를 정의하며, 기능별(예: `qna/`, `contact/`, `admin/`)로 모듈화합니다.
- `composables/`: Vue Composition API를 활용한 재사용 가능한 로직(함수)을 정의합니다.
- `stores/`: Pinia를 사용하여 전역 상태를 관리하는 스토어를 정의합니다.
- `assets/`: 공통 CSS, 이미지 등 정적 자원을 포함합니다.
- `middleware/`: Nuxt.js 미들웨어를 정의합니다.
- `plugins/`: Nuxt.js 플러그인을 정의합니다.

## 코드 표준

### 명명 규칙
- 컴포넌트: PascalCase (예: `MyComponent.vue`)
- 컴포저블: use 접두사 사용 (예: `useAuth.js`)
- 스토어: ~Store 접미사 사용 (예: `userStore.js`)
- API 엔드포인트: kebab-case (예: `my-api-endpoint.get.js`)

### 포맷팅 및 주석
- Prettier와 ESLint 설정을 준수하여 코드 포맷팅을 유지합니다.
- 모든 `.vue` 파일 내 함수에는 명확한 주석을 추가해야 합니다. [[memory:713749]]

## 기능 구현 표준

### 에디터 및 이미지 처리
- Quill 에디터 사용 시, 이미지는 WebP 포맷, 품질 85%, 리사이징 없이 압축하고, 서버 Sharp 압축 → 클라이언트 Canvas 압축 → 원본 사용의 3단계 폴백 시스템을 적용해야 합니다. 관련 로직은 `CommonQuillEditor.vue` 및 `server/api/upload/compress.post.js`에 구현되어 있습니다. [[memory:713756]]

### API 에러 처리
- `handleApiError` 함수의 시그니처는 `handleApiError(event, statusCode, message)` 패턴을 따라야 합니다. 모든 관리자 API에서 이 패턴을 준수해야 합니다. [[memory:713755]]

### UI/UX 구현
- 아웃라이너의 경고창은 `useModal` 컴포저블을 활용한 팝업 모달로 변경해야 합니다. [[memory:713754]]
- 아웃라이너 섹션에 글래스모피즘 디자인을 적용해야 합니다. [[memory:713753]]
- 아웃라이너 미리보기 창 리사이즈 기능을 `pages/outliner.vue`에 구현하고, 상태를 `localStorage`에 저장해야 합니다. [[memory:713752]]
- `pages/outliner.vue`와 `components/OutlineItem.vue`를 수정하여 엔터 키로 새 형제 노드 생성 및 백스페이스로 빈 노드 삭제 기능을 구현해야 합니다. [[memory:713751]]
- 유튜브 갤러리 크게 보기 화면에 대한 TODO 목록은 `pages/youtube-gallery.vue`에 추가해야 합니다. [[memory:713750]]

## 핵심 파일 상호작용 표준

### 프론트엔드 - 백엔드 통신
- 모든 클라이언트-서버 통신은 `server/api`에 정의된 API 엔드포인트를 통해 이루어져야 합니다.

### 상태 관리
- 전역적으로 공유되는 데이터는 Pinia 스토어(`stores/`)를 통해 관리되어야 합니다.

### 재사용 가능한 로직
- 여러 컴포넌트 또는 페이지에서 재사용되는 로직은 `composables/`에 정의하여 사용합니다.

## AI 의사 결정 표준

### 작업 우선순위
- 사용자 요청을 최우선으로 처리합니다.
- 명확한 지시가 없는 경우, 기존 코드베이스의 일관성과 유지보수성을 향상시키는 방향으로 판단합니다.

### 모호한 요청 처리
- 모호한 지시가 있을 경우, 먼저 코드베이스, 최근 변경사항, 기존 `shrimp-rules.md`를 분석하여 가능한 업데이트 지점을 추론하고 구체적인 수정 제안을 제시합니다. 사용자에게 직접적인 추가 설명 요청은 최종 수단으로만 사용합니다.

## 금지된 작업

### 일반적인 개발 지식 포함 금지
- `shrimp-rules.md`에는 LLM이 이미 알고 있는 일반적인 개발 지식(예: JavaScript 기본 문법, Vue 라이프사이클 훅 설명 등)을 포함해서는 안 됩니다. 오직 이 프로젝트에 특화된 규칙과 제약 사항만 명시해야 합니다.

### 디버깅 로그
- 불필요한 `console.log`, `console.error` 등 디버깅 로그는 프로덕션 환경에 배포되기 전에 반드시 제거해야 합니다. [[memory:2484031]]

### 프로젝트 기능 설명 금지
- `shrimp-rules.md`는 프로젝트의 기능을 설명하는 문서가 아니라, 기능을 어떻게 수정하거나 추가해야 하는지에 대한 지침을 제공하는 문서입니다. 프로젝트 기능에 대한 자세한 설명은 제외합니다. 